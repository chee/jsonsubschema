# jsonsubschema (JavaScript/TypeScript)

JavaScript/TypeScript port of the jsonsubschema package - check if one JSON Schema is a subschema of another.

## Status

🚧 **Work in Progress** - This is an in-development port of the Python implementation.

## What is jsonsubschema?

A tool that checks if one JSON schema is a **subschema (subtype)** of another JSON schema. For schemas s1 and s2, s1 <: s2 (reads "s1 is a subschema of s2") if every JSON document that validates against s1 also validates against s2.

### Use Cases

- **Schema evolution analysis** - Check if newer schema versions maintain backward compatibility
- **Static type checking** - Ensure components using JSON Schema maintain type safety
- **API compatibility** - Verify API schema changes don't break existing clients

## Installation

```bash
npm install jsonsubschema
# or
yarn add jsonsubschema
# or
pnpm add jsonsubschema
```

## Usage

```typescript
import { isSubschema, meetSchemas, joinSchemas, isEquivalent } from 'jsonsubschema'

// Check if one schema is a subschema of another
const s1 = { type: 'integer' }
const s2 = { type: 'number' }

console.log(isSubschema(s1, s2)) // true - all integers are numbers

// Check if schemas are equivalent
const s3 = { type: 'integer', minimum: 5 }
const s4 = { type: 'integer', minimum: 5 }

console.log(isEquivalent(s3, s4)) // true

// Compute meet (intersection) of schemas
const meet = meetSchemas(
  { type: 'integer', minimum: 0 },
  { type: 'integer', maximum: 10 }
)
// Result: { type: 'integer', minimum: 0, maximum: 10 }

// Compute join (union) of schemas
const join = joinSchemas(
  { type: 'integer', minimum: 0, maximum: 5 },
  { type: 'integer', minimum: 6, maximum: 10 }
)
// Result: { type: 'integer', minimum: 0, maximum: 10 }
```

## API

### `isSubschema(s1, s2)`

Check if schema s1 is a subschema of schema s2.

- **Returns**: `true` if s1 is a subschema of s2, `false` or `null` otherwise

### `isEquivalent(s1, s2)`

Check if two schemas are equivalent (accept the same set of JSON documents).

- **Returns**: `true` if schemas are equivalent, `false` otherwise

### `meetSchemas(s1, s2)`

Compute the meet (greatest lower bound / intersection) of two schemas.

- **Returns**: The most permissive schema that is a subschema of both s1 and s2

### `joinSchemas(s1, s2)`

Compute the join (least upper bound / union) of two schemas.

- **Returns**: The most restrictive schema that both s1 and s2 are subschemas of

## Supported Features

JSON Schema Draft 4 features:

- **Types**: null, boolean, integer, number, string, array, object
- **Numeric constraints**: minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf
- **String constraints**: minLength, maxLength, pattern
- **Array constraints**: items, additionalItems, minItems, maxItems, uniqueItems
- **Object constraints**: properties, additionalProperties, required, minProperties, maxProperties, dependencies, patternProperties
- **Logical operators**: allOf, anyOf, oneOf, not
- **Enumeration**: enum, const
- **References**: $ref

## Development

### Setup

```bash
cd js
npm install
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build the package
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

## Test Fixtures

This implementation shares test fixtures with the Python version, ensuring 100% test parity between implementations. Fixtures are located in `../test/fixtures/` and are organized by category:

- `api/` - API-level tests
- `types/` - Type-specific tests (integer, number, string, etc.)
- `features/` - Feature-specific tests (refs, logical operators, etc.)
- `integration/` - Complex integration tests

## Implementation Notes

### Differences from Python

- **Return values**: Like the Python version, `isSubschema` may return `null` to indicate "not a subschema" in certain cases
- **Number precision**: JavaScript uses IEEE 754 floating-point, while Python has arbitrary precision integers. This is handled appropriately in numeric operations.

### Architecture

The implementation follows the same architecture as the Python version:

1. **Canonicalization**: Schemas are normalized to a canonical form
2. **Checker embedding**: Type-specific checkers are embedded in the schema structure
3. **Subtype checking**: Checkers implement the subtype relation logic
4. **Operations**: Meet and join operations are computed using checker operations

## Credits

This JavaScript/TypeScript implementation is based on the Python [jsonsubschema](https://github.com/IBM/jsonsubschema) package and the research paper:

**"Is My JSON Schema Valid?"** by Andrew Habib and Avraham Shinnar
*ISSTA 2021* - Distinguished Artifact Award

## License

Apache 2.0 - See LICENSE file for details
