/**
 * jsonsubschema - Check if one JSON Schema is a subschema of another
 * JavaScript/TypeScript implementation
 *
 * Based on the Python implementation and academic research from ISSTA 2021
 */

export { isSubschema, meetSchemas, joinSchemas, isEquivalent } from './api'
export type { JSONSchema, JSONSchemaType, TestCase, FixtureFile } from './types'
