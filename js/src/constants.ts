/**
 * Constants for JSON Schema keywords and types
 */

export const JSON_SCHEMA_TYPES = [
  'null',
  'boolean',
  'integer',
  'number',
  'string',
  'array',
  'object',
] as const

export const NUMERIC_TYPES = ['integer', 'number'] as const

export const JSON_SCHEMA_KEYWORDS = {
  // Type
  type: 'type',

  // Numeric
  minimum: 'minimum',
  maximum: 'maximum',
  exclusiveMinimum: 'exclusiveMinimum',
  exclusiveMaximum: 'exclusiveMaximum',
  multipleOf: 'multipleOf',

  // String
  minLength: 'minLength',
  maxLength: 'maxLength',
  pattern: 'pattern',

  // Array
  items: 'items',
  additionalItems: 'additionalItems',
  minItems: 'minItems',
  maxItems: 'maxItems',
  uniqueItems: 'uniqueItems',

  // Object
  properties: 'properties',
  additionalProperties: 'additionalProperties',
  required: 'required',
  minProperties: 'minProperties',
  maxProperties: 'maxProperties',
  dependencies: 'dependencies',
  patternProperties: 'patternProperties',

  // Logical
  allOf: 'allOf',
  anyOf: 'anyOf',
  oneOf: 'oneOf',
  not: 'not',

  // Enum
  enum: 'enum',
  const: 'const',

  // Reference
  $ref: '$ref',
} as const

// Special schema values
export const EMPTY_SCHEMA = {}
export const FALSE_SCHEMA = false
export const TRUE_SCHEMA = true

// Type hierarchy
export const TYPE_HIERARCHY: Record<string, Set<string>> = {
  integer: new Set(['integer', 'number']),
  number: new Set(['number']),
  string: new Set(['string']),
  boolean: new Set(['boolean']),
  null: new Set(['null']),
  array: new Set(['array']),
  object: new Set(['object']),
}
