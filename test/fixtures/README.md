# JSON Test Fixtures

This directory contains JSON test fixtures that are shared between the Python and JavaScript implementations of jsonsubschema.

## Purpose

By converting tests to JSON fixtures, we ensure:
- **Test parity** between Python and JavaScript implementations
- **Language-agnostic** test definitions
- **Easier maintenance** - update tests in one place
- **Clear test documentation** - JSON format is self-describing

## Directory Structure

```
fixtures/
├── api/          # API-level tests (isSubschema, meet, join, isEquivalent)
├── types/        # Type-specific tests (integer, number, string, array, object, etc.)
├── features/     # Feature-specific tests (refs, logical operators, etc.)
└── integration/  # Complex integration tests
```

## Fixture Format

Each JSON fixture file contains an array of test cases with the following structure:

```json
{
  "description": "Description of the test suite",
  "tests": [
    {
      "name": "test_name",
      "description": "Human-readable description of what this test checks",
      "schema1": { "type": "integer" },
      "schema2": { "type": "number" },
      "operations": {
        "isSubschema": {
          "s1_sub_s2": true,
          "s2_sub_s1": false
        },
        "isEquivalent": false,
        "meet": { "type": "integer" },
        "join": { "type": "number" }
      }
    }
  ]
}
```

## Field Descriptions

### Top Level
- **description**: Brief description of the entire test suite
- **tests**: Array of individual test cases

### Test Case
- **name**: Unique identifier for the test (typically the original test method name)
- **description**: (Optional) Human-readable explanation of the test
- **schema1**: First JSON Schema to test
- **schema2**: Second JSON Schema to test
- **operations**: Object containing expected results for various operations

### Operations
Each operation is optional. Include only the operations relevant to the test.

- **isSubschema**: Object with two boolean fields:
  - `s1_sub_s2`: Expected result of `isSubschema(schema1, schema2)`
  - `s2_sub_s1`: Expected result of `isSubschema(schema2, schema1)`

- **isEquivalent**: Boolean indicating if schemas are equivalent

- **meet**: Expected schema result of `meetSchemas(schema1, schema2)`

- **join**: Expected schema result of `joinSchemas(schema1, schema2)`

## Example Usage

### Python
```python
from test.fixture_loader import FixtureLoader

loader = FixtureLoader()
fixtures = loader.load_fixture('types', 'integer.json')

for test in fixtures['tests']:
    s1 = test['schema1']
    s2 = test['schema2']
    assert isSubschema(s1, s2) == test['operations']['isSubschema']['s1_sub_s2']
```

### JavaScript
```typescript
import { FixtureLoader } from './fixture-loader'
import { isSubschema } from '../src'

const loader = new FixtureLoader()
const fixtures = loader.loadFixture('types', 'integer.json')

fixtures.tests.forEach(test => {
  const result = isSubschema(test.schema1, test.schema2)
  expect(result).toBe(test.operations.isSubschema.s1_sub_s2)
})
```

## Special Cases

### Error Cases
For tests that should raise errors, use the `shouldError` field:

```json
{
  "name": "invalid_schema",
  "schema1": { "type": "invalid_type" },
  "schema2": { "type": "string" },
  "shouldError": true,
  "errorType": "SchemaError"
}
```

### Skip/Todo Tests
For tests that are known to be failing or not yet implemented:

```json
{
  "name": "future_feature",
  "skip": true,
  "skipReason": "Feature not yet implemented",
  "schema1": { ... },
  "schema2": { ... },
  "operations": { ... }
}
```

## Conversion Guidelines

When converting Python tests to fixtures:

1. **Preserve test names**: Use the original Python test method name (without `test_` prefix)
2. **Extract schemas**: Copy the schema dictionaries exactly as they appear
3. **Capture all assertions**: Each `self.assert*()` becomes an operation expectation
4. **Handle subTests**: Each `with self.subTest()` becomes a separate test case
5. **Document intent**: Add descriptions to explain non-obvious test cases

## Validation

Fixtures should be validated to ensure:
- All schemas are valid JSON Schema Draft 4
- All required fields are present
- Operation results are the expected types
- No duplicate test names within a file

Run validation with:
```bash
python scripts/validate_fixtures.py
```
