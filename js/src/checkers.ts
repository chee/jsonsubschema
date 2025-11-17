/**
 * Schema checker classes for subtype checking
 */

import type { JSONSchema, SchemaChecker } from './types'
import { isPlainObject, deepEqual } from './utils'

/**
 * Base checker class
 */
export abstract class BaseChecker implements SchemaChecker {
  abstract isSubtype(other: SchemaChecker): boolean | null
  abstract meet(other: SchemaChecker): SchemaChecker
  abstract join(other: SchemaChecker): SchemaChecker
  abstract toSchema(): JSONSchema

  /**
   * Helper to check if this checker is equivalent to another
   */
  isEquivalent(other: SchemaChecker): boolean {
    const sub1 = this.isSubtype(other)
    const sub2 = other.isSubtype(this)
    return sub1 === true && sub2 === true
  }
}

/**
 * Interval class for representing numeric ranges
 */
export class Interval {
  constructor(
    public min: number | null,
    public max: number | null,
    public exclusiveMin: boolean = false,
    public exclusiveMax: boolean = false
  ) {}

  /**
   * Check if this interval is a subinterval of another
   */
  isSubintervalOf(other: Interval): boolean {
    // Check minimum constraint
    if (other.min !== null) {
      if (this.min === null) return false
      if (this.min < other.min) return false
      if (this.min === other.min && other.exclusiveMin && !this.exclusiveMin) {
        return false
      }
    }

    // Check maximum constraint
    if (other.max !== null) {
      if (this.max === null) return false
      if (this.max > other.max) return false
      if (this.max === other.max && other.exclusiveMax && !this.exclusiveMax) {
        return false
      }
    }

    return true
  }

  /**
   * Check if interval is empty
   */
  isEmpty(): boolean {
    if (this.min === null || this.max === null) return false
    if (this.min > this.max) return true
    if (this.min === this.max && (this.exclusiveMin || this.exclusiveMax)) return true
    return false
  }

  /**
   * Intersect two intervals
   */
  intersect(other: Interval): Interval {
    let newMin = this.min
    let newExclusiveMin = this.exclusiveMin

    if (other.min !== null) {
      if (newMin === null || other.min > newMin) {
        newMin = other.min
        newExclusiveMin = other.exclusiveMin
      } else if (other.min === newMin) {
        newExclusiveMin = this.exclusiveMin || other.exclusiveMin
      }
    }

    let newMax = this.max
    let newExclusiveMax = this.exclusiveMax

    if (other.max !== null) {
      if (newMax === null || other.max < newMax) {
        newMax = other.max
        newExclusiveMax = other.exclusiveMax
      } else if (other.max === newMax) {
        newExclusiveMax = this.exclusiveMax || other.exclusiveMax
      }
    }

    return new Interval(newMin, newMax, newExclusiveMin, newExclusiveMax)
  }
}

/**
 * Checker for integer types
 */
export class IntegerChecker extends BaseChecker {
  public interval: Interval
  public multipleOf: number | null

  constructor(schema: JSONSchema) {
    super()

    // Extract interval constraints
    const min = schema.minimum ?? null
    const max = schema.maximum ?? null
    const exclusiveMin = schema.exclusiveMinimum ?? false
    const exclusiveMax = schema.exclusiveMaximum ?? false

    this.interval = new Interval(min, max, exclusiveMin, exclusiveMax)
    this.multipleOf = schema.multipleOf ?? null
  }

  isSubtype(other: SchemaChecker): boolean | null {
    // Integer vs Number
    if (other instanceof NumberChecker) {
      // Integer is subtype of number if constraints are compatible
      if (!this.interval.isSubintervalOf(other.interval)) {
        return false
      }

      // Check multipleOf compatibility
      if (other.multipleOf !== null) {
        if (this.multipleOf !== null) {
          // Both have multipleOf - check divisibility
          if (!Number.isInteger(this.multipleOf / other.multipleOf)) {
            return null
          }
        } else if (Number.isInteger(other.multipleOf)) {
          // Other has integer multipleOf, we have none
          // Integer with no multipleOf includes all integers
          // Number with integer multipleOf is subset of integers
          return null
        } else {
          // Other has non-integer multipleOf, integers can't satisfy it
          return null
        }
      }

      return true
    }

    if (!(other instanceof IntegerChecker)) {
      return null
    }

    // Integer vs Integer
    // Check interval constraints
    if (!this.interval.isSubintervalOf(other.interval)) {
      return false
    }

    // Check multipleOf constraints
    if (other.multipleOf !== null) {
      if (this.multipleOf !== null) {
        // Check if this.multipleOf is a multiple of other.multipleOf
        if (this.multipleOf % other.multipleOf !== 0) {
          return null
        }
      } else {
        // other has multipleOf but this doesn't
        return null
      }
    }

    return true
  }

  meet(other: SchemaChecker): SchemaChecker {
    if (other instanceof IntegerChecker) {
      const schema: JSONSchema = { type: 'integer' }

      // Intersect intervals
      const newInterval = this.interval.intersect(other.interval)
      if (newInterval.min !== null) {
        schema.minimum = newInterval.min
        schema.exclusiveMinimum = newInterval.exclusiveMin
      }
      if (newInterval.max !== null) {
        schema.maximum = newInterval.max
        schema.exclusiveMaximum = newInterval.exclusiveMax
      }

      // Handle multipleOf
      if (this.multipleOf !== null && other.multipleOf !== null) {
        // LCM of the two multipleOf values
        schema.multipleOf = this.lcm(this.multipleOf, other.multipleOf)
      } else if (this.multipleOf !== null) {
        schema.multipleOf = this.multipleOf
      } else if (other.multipleOf !== null) {
        schema.multipleOf = other.multipleOf
      }

      return new IntegerChecker(schema)
    }

    throw new Error('Meet not implemented for these types')
  }

  join(other: SchemaChecker): SchemaChecker {
    throw new Error('Join not yet implemented')
  }

  toSchema(): JSONSchema {
    const schema: JSONSchema = { type: 'integer' }

    if (this.interval.min !== null) {
      schema.minimum = this.interval.min
      if (this.interval.exclusiveMin) {
        schema.exclusiveMinimum = true
      }
    }

    if (this.interval.max !== null) {
      schema.maximum = this.interval.max
      if (this.interval.exclusiveMax) {
        schema.exclusiveMaximum = true
      }
    }

    if (this.multipleOf !== null) {
      schema.multipleOf = this.multipleOf
    }

    return schema
  }

  private lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b)
  }
}

/**
 * Checker for number types
 */
export class NumberChecker extends BaseChecker {
  public interval: Interval
  public multipleOf: number | null

  constructor(schema: JSONSchema) {
    super()

    const min = schema.minimum ?? null
    const max = schema.maximum ?? null
    const exclusiveMin = schema.exclusiveMinimum ?? false
    const exclusiveMax = schema.exclusiveMaximum ?? false

    this.interval = new Interval(min, max, exclusiveMin, exclusiveMax)
    this.multipleOf = schema.multipleOf ?? null
  }

  isSubtype(other: SchemaChecker): boolean | null {
    if (other instanceof IntegerChecker) {
      // Number is generally not a subtype of integer
      // Exception: if number has multipleOf 1, it's equivalent to integer
      if (this.multipleOf === 1) {
        return new IntegerChecker(this.toSchema()).isSubtype(other)
      }
      return null
    }

    if (!(other instanceof NumberChecker)) {
      return null
    }

    // Number vs Number
    if (!this.interval.isSubintervalOf(other.interval)) {
      return false
    }

    // Check multipleOf
    if (other.multipleOf !== null) {
      if (this.multipleOf !== null) {
        // Check divisibility - for numbers this is more complex
        const ratio = this.multipleOf / other.multipleOf
        if (!Number.isInteger(ratio)) {
          return null
        }
      } else {
        return null
      }
    }

    return true
  }

  meet(other: SchemaChecker): SchemaChecker {
    if (other instanceof NumberChecker) {
      const schema: JSONSchema = { type: 'number' }

      const newInterval = this.interval.intersect(other.interval)
      if (newInterval.min !== null) {
        schema.minimum = newInterval.min
        schema.exclusiveMinimum = newInterval.exclusiveMin
      }
      if (newInterval.max !== null) {
        schema.maximum = newInterval.max
        schema.exclusiveMaximum = newInterval.exclusiveMax
      }

      if (this.multipleOf !== null && other.multipleOf !== null) {
        schema.multipleOf = this.lcm(this.multipleOf, other.multipleOf)
      } else if (this.multipleOf !== null) {
        schema.multipleOf = this.multipleOf
      } else if (other.multipleOf !== null) {
        schema.multipleOf = other.multipleOf
      }

      return new NumberChecker(schema)
    }

    throw new Error('Meet not implemented for these types')
  }

  join(other: SchemaChecker): SchemaChecker {
    throw new Error('Join not yet implemented')
  }

  toSchema(): JSONSchema {
    const schema: JSONSchema = { type: 'number' }

    if (this.interval.min !== null) {
      schema.minimum = this.interval.min
      if (this.interval.exclusiveMin) {
        schema.exclusiveMinimum = true
      }
    }

    if (this.interval.max !== null) {
      schema.maximum = this.interval.max
      if (this.interval.exclusiveMax) {
        schema.exclusiveMaximum = true
      }
    }

    if (this.multipleOf !== null) {
      schema.multipleOf = this.multipleOf
    }

    return schema
  }

  private lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b)
  }
}

/**
 * Create a checker from a schema
 */
export function createChecker(schema: JSONSchema): SchemaChecker {
  // Determine the type
  const type = schema.type

  if (type === 'integer') {
    return new IntegerChecker(schema)
  }

  if (type === 'number') {
    return new NumberChecker(schema)
  }

  throw new Error(`Unsupported schema type: ${type}`)
}
