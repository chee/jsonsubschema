# Plan: JavaScript Port of jsonsubschema

## Overview
Port the jsonsubschema Python package to JavaScript/TypeScript, making it runnable in modern browsers and Node.js. The approach will ensure test parity by first converting tests to JSON fixtures that both implementations can share.

## Phase 1: Extract Test Fixtures (JSON Format)

### 1.1 Create Fixture Directory Structure
```
test/fixtures/
├── README.md                    # Documentation on fixture format
├── api/                        # API-level tests
│   ├── isSubschema.json
│   ├── meet.json
│   ├── join.json
│   └── isEquivalent.json
├── types/                      # Type-specific tests
│   ├── integer.json
│   ├── number.json
│   ├── string.json
│   ├── array.json
│   ├── object.json
│   ├── boolean.json
│   ├── null.json
│   ├── const.json
│   └── enum.json
├── features/                   # Feature-specific tests
│   ├── refs.json              # $ref handling
│   ├── allOf.json
│   ├── anyOf.json
│   ├── oneOf.json
│   ├── not.json
│   └── mixed.json
└── integration/               # Complex integration tests
    ├── from_lale.json        # Tests from LALE project
    └── ai_subschema.json     # AI-related tests
```

### 1.2 Fixture Format Specification
Each JSON fixture file will contain an array of test cases:

```json
{
  "description": "Integer subtype tests",
  "tests": [
    {
      "name": "identity",
      "description": "A schema should be a subschema of itself",
      "schema1": {"type": "integer"},
      "schema2": {"type": "integer"},
      "operations": {
        "isSubschema": {
          "s1_sub_s2": true,
          "s2_sub_s1": true
        },
        "isEquivalent": true,
        "meet": {"type": "integer"},
        "join": {"type": "integer"}
      }
    },
    {
      "name": "min_min",
      "description": "More restrictive minimum is a subtype",
      "schema1": {"type": "integer", "minimum": 5},
      "schema2": {"type": "integer", "minimum": 1},
      "operations": {
        "isSubschema": {
          "s1_sub_s2": true,
          "s2_sub_s1": false
        }
      }
    }
  ]
}
```

### 1.3 Extraction Script
Create `scripts/extract_fixtures.py`:
- Parse all test files in `test/` directory
- Extract test cases from unittest methods
- Convert to JSON fixture format
- Validate schema correctness
- Group by category (type, feature, etc.)
- Generate summary report

**Key challenges:**
- Handle subTest contexts correctly
- Preserve test names and descriptions
- Extract inline schemas accurately
- Handle special test cases (error conditions, edge cases)

## Phase 2: Update Python Tests to Use Fixtures

### 2.1 Create Fixture Loader
Create `test/fixture_loader.py`:
```python
import json
import os
from pathlib import Path

class FixtureLoader:
    def __init__(self, fixtures_dir='test/fixtures'):
        self.fixtures_dir = Path(fixtures_dir)

    def load_fixture(self, category, filename):
        """Load a specific fixture file"""
        path = self.fixtures_dir / category / filename
        with open(path) as f:
            return json.load(f)

    def load_all_fixtures(self):
        """Load all fixture files"""
        # Returns dict of all fixtures organized by category
        pass
```

### 2.2 Create Parameterized Test Runner
Create `test/test_from_fixtures.py`:
```python
import unittest
from test.fixture_loader import FixtureLoader
from jsonsubschema import isSubschema, meetSchemas, joinSchemas, isEquivalent

class TestFromFixtures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.loader = FixtureLoader()

    def run_fixture_tests(self, fixture_data):
        """Run all tests from a fixture file"""
        for test_case in fixture_data['tests']:
            with self.subTest(test=test_case['name']):
                self.run_single_test(test_case)

    def run_single_test(self, test_case):
        """Run a single test case"""
        s1 = test_case['schema1']
        s2 = test_case['schema2']
        ops = test_case['operations']

        if 'isSubschema' in ops:
            self.assertEqual(
                isSubschema(s1, s2),
                ops['isSubschema']['s1_sub_s2']
            )
            self.assertEqual(
                isSubschema(s2, s1),
                ops['isSubschema']['s2_sub_s1']
            )

        # ... handle other operations
```

### 2.3 Keep Original Tests as Regression Suite
- Keep all original test files (`test_*.py`)
- They serve as regression tests during migration
- Can be deprecated once fixture-based tests are verified

### 2.4 Validation Steps
1. Run original tests: `python -m unittest --v`
2. Run fixture-based tests: `python -m unittest test.test_from_fixtures --v`
3. Compare coverage reports
4. Ensure 100% test parity

## Phase 3: JavaScript/TypeScript Implementation Setup

### 3.1 Project Structure
```
js/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts              # Main exports
│   ├── api.ts                # Public API (isSubschema, meet, join, etc.)
│   ├── checkers.ts           # Core subtype checking logic
│   ├── canonicalization.ts   # Schema normalization
│   ├── utils.ts              # Utility functions
│   ├── constants.ts          # JSON Schema keywords
│   ├── types.ts              # TypeScript type definitions
│   └── exceptions.ts         # Error classes
├── test/
│   ├── setup.ts              # Test setup
│   ├── fixtures.test.ts      # Main fixture-based tests
│   └── utils.test.ts         # Utility tests
└── dist/                     # Build output
    ├── index.js              # CommonJS
    ├── index.mjs             # ES modules
    ├── index.d.ts            # TypeScript definitions
    └── browser.js            # Browser bundle
```

### 3.2 Package Configuration

**package.json:**
```json
{
  "name": "jsonsubschema",
  "version": "0.1.0",
  "description": "Check if one JSON Schema is a subschema of another",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "browser": "dist/browser.js",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src test"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0"
  },
  "dependencies": {
    "@types/json-schema": "^7.0.15"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['dist/**', 'test/**']
    }
  }
})
```

### 3.3 Build Configuration

**tsup.config.ts:**
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  platform: 'neutral', // Works in both Node and browser
})
```

## Phase 4: Write Vitest Tests

### 4.1 Fixture Loader for JavaScript
Create `test/fixture-loader.ts`:
```typescript
import { readFileSync } from 'fs'
import { join } from 'path'

export interface TestCase {
  name: string
  description?: string
  schema1: any
  schema2: any
  operations: {
    isSubschema?: {
      s1_sub_s2: boolean
      s2_sub_s1: boolean
    }
    isEquivalent?: boolean
    meet?: any
    join?: any
  }
}

export interface FixtureFile {
  description: string
  tests: TestCase[]
}

export class FixtureLoader {
  private fixturesDir: string

  constructor(fixturesDir = '../test/fixtures') {
    this.fixturesDir = fixturesDir
  }

  loadFixture(category: string, filename: string): FixtureFile {
    const path = join(__dirname, this.fixturesDir, category, filename)
    return JSON.parse(readFileSync(path, 'utf-8'))
  }

  loadAllFixtures(): Record<string, FixtureFile[]> {
    // Implementation to load all fixtures
  }
}
```

### 4.2 Main Test File
Create `test/fixtures.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { FixtureLoader } from './fixture-loader'
import { isSubschema, meetSchemas, joinSchemas, isEquivalent } from '../src'

const loader = new FixtureLoader()

// Test each fixture category
const categories = ['api', 'types', 'features', 'integration']

categories.forEach(category => {
  describe(category, () => {
    const fixtures = loader.loadCategoryFixtures(category)

    fixtures.forEach(fixtureFile => {
      describe(fixtureFile.description, () => {
        fixtureFile.tests.forEach(test => {
          it(test.name, () => {
            const { schema1, schema2, operations } = test

            if (operations.isSubschema) {
              expect(isSubschema(schema1, schema2))
                .toBe(operations.isSubschema.s1_sub_s2)
              expect(isSubschema(schema2, schema1))
                .toBe(operations.isSubschema.s2_sub_s1)
            }

            if (operations.isEquivalent !== undefined) {
              expect(isEquivalent(schema1, schema2))
                .toBe(operations.isEquivalent)
            }

            if (operations.meet) {
              const result = meetSchemas(schema1, schema2)
              expect(result).toEqual(operations.meet)
            }

            if (operations.join) {
              const result = joinSchemas(schema1, schema2)
              expect(result).toEqual(operations.join)
            }
          })
        })
      })
    })
  })
})
```

### 4.3 Test Execution Strategy
1. Run tests in Node.js environment first (simpler, easier debugging)
2. Add browser tests later using @vitest/browser
3. Start with simple type tests, gradually add complexity
4. Use snapshot testing for complex schema outputs

## Phase 5: JavaScript Implementation

### 5.1 Implementation Order (TDD Approach)

**Step 1: Core Types and Interfaces**
- Define TypeScript interfaces for JSON Schema
- Define checker interfaces
- Basic type guards and utilities

**Step 2: Simple Type Checkers (easiest first)**
- Null type checker
- Boolean type checker
- Simple numeric constraints (no multipleOf)
- Simple string constraints (no pattern)

**Step 3: Basic Operations**
- Simple isSubschema for primitive types
- Schema canonicalization basics
- Type hierarchy logic

**Step 4: Complex Type Checkers**
- Full integer/number checker (with multipleOf)
- String pattern checker (regex operations)
- Enum checker
- Const checker

**Step 5: Composite Types**
- Array checker (items, additionalItems, etc.)
- Object checker (properties, additionalProperties, etc.)

**Step 6: Logical Operators**
- allOf
- anyOf
- oneOf
- not

**Step 7: Schema References**
- $ref resolution
- Circular reference handling

**Step 8: Meet and Join Operations**
- Implement meetSchemas
- Implement joinSchemas
- Implement isEquivalent

### 5.2 Key Implementation Files

**src/types.ts:**
```typescript
export type JSONSchemaType =
  | 'null'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'string'
  | 'array'
  | 'object'

export interface JSONSchema {
  type?: JSONSchemaType | JSONSchemaType[]

  // Numeric
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean
  exclusiveMaximum?: boolean
  multipleOf?: number

  // String
  minLength?: number
  maxLength?: number
  pattern?: string

  // Array
  items?: JSONSchema | JSONSchema[]
  additionalItems?: boolean | JSONSchema
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean

  // Object
  properties?: Record<string, JSONSchema>
  additionalProperties?: boolean | JSONSchema
  required?: string[]
  minProperties?: number
  maxProperties?: number
  dependencies?: Record<string, JSONSchema | string[]>
  patternProperties?: Record<string, JSONSchema>

  // Logical
  allOf?: JSONSchema[]
  anyOf?: JSONSchema[]
  oneOf?: JSONSchema[]
  not?: JSONSchema

  // Enum
  enum?: any[]
  const?: any

  // Reference
  $ref?: string
}

export interface SchemaChecker {
  isSubtype(other: SchemaChecker): boolean
  meet(other: SchemaChecker): SchemaChecker
  join(other: SchemaChecker): SchemaChecker
}
```

**src/api.ts:**
```typescript
import { JSONSchema } from './types'
import { canonicalizeSchema } from './canonicalization'
import { simplifySchemaAndEmbedCheckers } from './checkers'

export function isSubschema(s1: JSONSchema, s2: JSONSchema): boolean {
  const checker1 = simplifySchemaAndEmbedCheckers(canonicalizeSchema(s1))
  const checker2 = simplifySchemaAndEmbedCheckers(canonicalizeSchema(s2))
  return checker1.isSubtype(checker2)
}

export function meetSchemas(s1: JSONSchema, s2: JSONSchema): JSONSchema {
  const checker1 = simplifySchemaAndEmbedCheckers(canonicalizeSchema(s1))
  const checker2 = simplifySchemaAndEmbedCheckers(canonicalizeSchema(s2))
  return checker1.meet(checker2).toSchema()
}

export function joinSchemas(s1: JSONSchema, s2: JSONSchema): JSONSchema {
  const checker1 = simplifySchemaAndEmbedCheckers(canonicalizeSchema(s1))
  const checker2 = simplifySchemaAndEmbedCheckers(canonicalizeSchema(s2))
  return checker1.join(checker2).toSchema()
}

export function isEquivalent(s1: JSONSchema, s2: JSONSchema): boolean {
  return isSubschema(s1, s2) && isSubschema(s2, s1)
}
```

### 5.3 Key Dependencies to Port

From Python to JavaScript equivalents:

| Python | JavaScript Alternative |
|--------|----------------------|
| `portion` (intervals) | Custom implementation or `interval-arithmetic` package |
| `greenery` (regex FSA) | Custom implementation or `refa` package |
| `jsonschema` (validation) | `ajv` package |
| `jsonref` ($ref resolution) | Custom implementation or `@apidevtools/json-schema-ref-parser` |

### 5.4 Implementation Challenges

**Challenge 1: Regex Operations**
- Python's `greenery` library for regex FSA operations
- JavaScript needs custom implementation or alternative
- May need to simplify or use approximations

**Challenge 2: Interval Arithmetic**
- Python's `portion` for numeric ranges
- JavaScript needs custom interval implementation
- Critical for multipleOf handling

**Challenge 3: Deep Equality**
- Schema comparison needs careful deep equality
- Consider using `fast-deep-equal` package

**Challenge 4: Number Precision**
- Python's arbitrary precision integers
- JavaScript's Number limitations (use BigInt where needed)

## Phase 6: Browser Compatibility

### 6.1 Build Browser Bundle
- Use tsup to create browser-friendly bundle
- Polyfill Node.js APIs if needed
- Test bundle size (<100KB gzipped ideal)

### 6.2 Browser Testing
```typescript
// vitest.config.browser.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright'
    }
  }
})
```

### 6.3 Example Usage in Browser
```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { isSubschema } from './dist/browser.js'

    const s1 = { type: 'integer' }
    const s2 = { type: 'number' }

    console.log(isSubschema(s1, s2)) // true
  </script>
</head>
</html>
```

## Phase 7: Documentation and Examples

### 7.1 Update README
- Add JavaScript usage examples
- Document both Node and browser usage
- API reference
- Migration guide from Python version

### 7.2 Examples Directory
```
examples/
├── node/
│   ├── basic.js
│   ├── typescript.ts
│   └── advanced.js
└── browser/
    ├── index.html
    ├── webpack-example/
    └── vite-example/
```

### 7.3 API Documentation
- Use TypeDoc for API documentation
- Generate from TypeScript comments
- Publish to GitHub Pages

## Success Criteria

- [ ] All Python tests converted to JSON fixtures
- [ ] Python tests pass using fixtures (100% parity)
- [ ] JavaScript package builds successfully
- [ ] All Vitest tests pass (100% fixture coverage)
- [ ] Works in Node.js (v18+)
- [ ] Works in modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] TypeScript types are correct and complete
- [ ] Documentation is comprehensive
- [ ] Package is published to npm
- [ ] CI/CD pipeline set up for JS tests

## Timeline Estimate

- **Phase 1** (Extract fixtures): 3-5 days
- **Phase 2** (Python fixture tests): 2-3 days
- **Phase 3** (JS setup): 1 day
- **Phase 4** (Vitest tests): 1 day
- **Phase 5** (JS implementation): 10-15 days
  - Core types: 1 day
  - Simple checkers: 2-3 days
  - Complex checkers: 3-4 days
  - Composite types: 3-4 days
  - Logical operators: 2-3 days
  - Meet/join: 2-3 days
- **Phase 6** (Browser): 2-3 days
- **Phase 7** (Docs): 2-3 days

**Total: 21-30 days**

## Open Questions

1. Should we use TypeScript or plain JavaScript?
   - **Recommendation**: TypeScript for better type safety and DX
2. Which package should we use for regex operations?
   - Need to evaluate `refa` vs custom implementation
3. How to handle Python-specific numeric precision?
   - May need BigInt for some operations
4. Should we maintain 100% API parity or make JS-idiomatic changes?
   - **Recommendation**: Maintain parity initially, iterate later
5. Package name on npm: `jsonsubschema` or `@jsonsubschema/core`?
   - Check availability on npm

## Next Steps

1. Create fixture directory structure
2. Write `scripts/extract_fixtures.py`
3. Run extraction on subset of tests (e.g., `test_numeric.py` first)
4. Validate fixture format with small Python test
5. Iterate on fixture format based on learnings
6. Scale to all tests
