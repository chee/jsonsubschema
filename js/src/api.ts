/**
 * Public API for jsonsubschema
 */

import { JSONSchema } from './types'

/**
 * Check if schema s1 is a subschema of schema s2
 *
 * A schema s1 is a subschema of s2 if every JSON document that validates
 * against s1 also validates against s2.
 *
 * @param s1 - First schema
 * @param s2 - Second schema
 * @returns true if s1 is a subschema of s2, false or null otherwise
 */
export function isSubschema(s1: JSONSchema, s2: JSONSchema): boolean | null {
  // TODO: Implement
  throw new Error('Not yet implemented')
}

/**
 * Compute the meet (greatest lower bound) of two schemas
 *
 * The meet of s1 and s2 is the most permissive schema that is a subschema
 * of both s1 and s2 (their intersection).
 *
 * @param s1 - First schema
 * @param s2 - Second schema
 * @returns The meet schema
 */
export function meetSchemas(s1: JSONSchema, s2: JSONSchema): JSONSchema {
  // TODO: Implement
  throw new Error('Not yet implemented')
}

/**
 * Compute the join (least upper bound) of two schemas
 *
 * The join of s1 and s2 is the most restrictive schema that both s1 and s2
 * are subschemas of (their union).
 *
 * @param s1 - First schema
 * @param s2 - Second schema
 * @returns The join schema
 */
export function joinSchemas(s1: JSONSchema, s2: JSONSchema): JSONSchema {
  // TODO: Implement
  throw new Error('Not yet implemented')
}

/**
 * Check if two schemas are equivalent
 *
 * Two schemas are equivalent if they accept exactly the same set of JSON documents.
 *
 * @param s1 - First schema
 * @param s2 - Second schema
 * @returns true if schemas are equivalent, false otherwise
 */
export function isEquivalent(s1: JSONSchema, s2: JSONSchema): boolean {
  return isSubschema(s1, s2) === true && isSubschema(s2, s1) === true
}
