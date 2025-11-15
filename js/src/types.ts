/**
 * JSON Schema types and interfaces
 * Based on JSON Schema Draft 4
 */

export type JSONSchemaType =
  | 'null'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'string'
  | 'array'
  | 'object'

/**
 * JSON Schema interface
 * Supports JSON Schema Draft 4 specification
 */
export interface JSONSchema {
  // Type constraint
  type?: JSONSchemaType | JSONSchemaType[]

  // Numeric constraints
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean
  exclusiveMaximum?: boolean
  multipleOf?: number

  // String constraints
  minLength?: number
  maxLength?: number
  pattern?: string

  // Array constraints
  items?: JSONSchema | JSONSchema[]
  additionalItems?: boolean | JSONSchema
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean

  // Object constraints
  properties?: Record<string, JSONSchema>
  additionalProperties?: boolean | JSONSchema
  required?: string[]
  minProperties?: number
  maxProperties?: number
  dependencies?: Record<string, JSONSchema | string[]>
  patternProperties?: Record<string, JSONSchema>

  // Logical operators
  allOf?: JSONSchema[]
  anyOf?: JSONSchema[]
  oneOf?: JSONSchema[]
  not?: JSONSchema

  // Enum and const
  enum?: any[]
  const?: any

  // Reference
  $ref?: string

  // Metadata (ignored for subschema checking)
  title?: string
  description?: string
  default?: any
  examples?: any[]

  // Allow additional properties for forward compatibility
  [key: string]: any
}

/**
 * Test case from JSON fixtures
 */
export interface TestCase {
  name: string
  description?: string
  schema1: JSONSchema
  schema2: JSONSchema
  operations: {
    isSubschema?: {
      s1_sub_s2: boolean
      s2_sub_s1: boolean
    }
    isEquivalent?: boolean
    meet?: JSONSchema
    join?: JSONSchema
  }
  shouldError?: boolean
  errorType?: string
  skip?: boolean
  skipReason?: string
}

/**
 * Fixture file structure
 */
export interface FixtureFile {
  description: string
  tests: TestCase[]
}

/**
 * Internal checker interface for schema operations
 */
export interface SchemaChecker {
  isSubtype(other: SchemaChecker): boolean | null
  meet(other: SchemaChecker): SchemaChecker
  join(other: SchemaChecker): SchemaChecker
  toSchema(): JSONSchema
}
