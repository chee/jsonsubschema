/**
 * Utility functions for schema operations
 */

import type { JSONSchema, JSONSchemaType } from './types'

/**
 * Check if a value is a plain object
 */
export function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Check if a schema represents the empty/true schema (accepts everything)
 */
export function isEmptySchema(schema: JSONSchema | boolean): boolean {
  if (schema === true) return true
  if (schema === false) return false
  if (!isPlainObject(schema)) return false
  return Object.keys(schema).length === 0
}

/**
 * Check if a schema represents the false schema (accepts nothing)
 */
export function isFalseSchema(schema: JSONSchema | boolean): boolean {
  return schema === false
}

/**
 * Normalize a type constraint to an array of types
 */
export function normalizeType(type: JSONSchemaType | JSONSchemaType[] | undefined): JSONSchemaType[] {
  if (type === undefined) {
    return ['null', 'boolean', 'integer', 'number', 'string', 'array', 'object']
  }
  return Array.isArray(type) ? type : [type]
}

/**
 * Check if two arrays have the same elements (order-independent)
 */
export function sameElements<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  if (set1.size !== set2.size) return false
  for (const item of set1) {
    if (!set2.has(item)) return false
  }
  return true
}

/**
 * Deep equality check for schemas
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (typeof a !== typeof b) return false

  if (typeof a !== 'object' || a === null || b === null) {
    // Handle NaN
    if (typeof a === 'number' && typeof b === 'number') {
      return Number.isNaN(a) && Number.isNaN(b) || a === b
    }
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }

  return true
}

/**
 * Check if integer is a subtype of number
 */
export function isIntegerSubtypeOfNumber(s1: JSONSchema, s2: JSONSchema): boolean {
  // Integer with multipleOf 1 is equivalent to integer
  // Number with multipleOf 1 is equivalent to integer
  if (s2.type === 'number' && s2.multipleOf === 1) {
    return true
  }

  // If number has integer multipleOf, integer can be subtype
  if (s2.type === 'number' && s2.multipleOf && Number.isInteger(s2.multipleOf)) {
    return true
  }

  return s2.type === 'number'
}

/**
 * Check if a number is effectively an integer (no fractional part)
 */
export function isEffectivelyInteger(n: number): boolean {
  return Number.isInteger(n) || n === Math.floor(n)
}

/**
 * Greatest common divisor for numbers (supports decimals)
 */
export function gcd(a: number, b: number): number {
  if (b === 0) return a
  return gcd(b, a % b)
}

/**
 * Least common multiple
 */
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

/**
 * Clone a schema (deep copy)
 */
export function cloneSchema(schema: JSONSchema): JSONSchema {
  return JSON.parse(JSON.stringify(schema))
}
