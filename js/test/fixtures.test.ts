/**
 * Fixture-based tests for jsonsubschema
 * These tests use the same JSON fixtures as the Python implementation
 */

import { describe, it, expect } from 'vitest'
import { FixtureLoader } from './fixture-loader'
import { isSubschema, meetSchemas, joinSchemas, isEquivalent } from '../src'
import type { TestCase } from '../src/types'

const loader = new FixtureLoader()

/**
 * Run a single test case from a fixture
 */
function runTestCase(test: TestCase, category: string, filename: string) {
  const { name, schema1, schema2, operations, shouldError, skip } = test

  if (skip) {
    it.skip(name, () => {
      // Skipped test
    })
    return
  }

  if (shouldError) {
    it(name, () => {
      expect(() => isSubschema(schema1, schema2)).toThrow()
    })
    return
  }

  describe(name, () => {
    // Test isSubschema operation
    if (operations.isSubschema) {
      const { s1_sub_s2, s2_sub_s1 } = operations.isSubschema

      it('s1 <: s2', () => {
        const result = isSubschema(schema1, schema2)
        if (s1_sub_s2) {
          expect(result).toBeTruthy()
        } else {
          // Note: isSubschema may return null for "not a subschema"
          expect(result).toBeFalsy()
        }
      })

      it('s2 <: s1', () => {
        const result = isSubschema(schema2, schema1)
        if (s2_sub_s1) {
          expect(result).toBeTruthy()
        } else {
          // Note: isSubschema may return null for "not a subschema"
          expect(result).toBeFalsy()
        }
      })
    }

    // Test isEquivalent operation
    if (operations.isEquivalent !== undefined) {
      it('isEquivalent', () => {
        const result = isEquivalent(schema1, schema2)
        expect(result).toBe(operations.isEquivalent)
      })
    }

    // Test meet operation
    if (operations.meet) {
      it('meet', () => {
        const result = meetSchemas(schema1, schema2)
        // Check if result is equivalent to expected
        expect(isEquivalent(result, operations.meet)).toBe(true)
      })
    }

    // Test join operation
    if (operations.join) {
      it('join', () => {
        const result = joinSchemas(schema1, schema2)
        // Check if result is equivalent to expected
        expect(isEquivalent(result, operations.join)).toBe(true)
      })
    }
  })
}

// Dynamically generate test suites for each fixture category
const allFixtures = loader.loadAllFixtures()

for (const [category, fixtures] of Object.entries(allFixtures)) {
  describe(category, () => {
    for (const [filename, fixtureData] of Object.entries(fixtures)) {
      describe(filename.replace('.json', ''), () => {
        for (const test of fixtureData.tests) {
          runTestCase(test, category, filename)
        }
      })
    }
  })
}
