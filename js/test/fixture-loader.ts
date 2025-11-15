/**
 * Fixture loader for JavaScript/TypeScript tests
 * Loads JSON test fixtures shared with Python implementation
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { FixtureFile, TestCase } from '../src/types'

// Get the directory path for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class FixtureLoader {
  private fixturesDir: string

  constructor(fixturesDir?: string) {
    if (fixturesDir) {
      this.fixturesDir = fixturesDir
    } else {
      // Default to test/fixtures relative to the project root
      this.fixturesDir = join(__dirname, '../../test/fixtures')
    }
  }

  /**
   * Load a specific fixture file
   */
  loadFixture(category: string, filename: string): FixtureFile {
    const path = join(this.fixturesDir, category, filename)
    const content = readFileSync(path, 'utf-8')
    return JSON.parse(content) as FixtureFile
  }

  /**
   * Load all fixture files in a category
   */
  loadCategory(category: string): Record<string, FixtureFile> {
    const categoryPath = join(this.fixturesDir, category)
    const files = readdirSync(categoryPath).filter(f => f.endsWith('.json'))

    const fixtures: Record<string, FixtureFile> = {}
    for (const file of files) {
      const content = readFileSync(join(categoryPath, file), 'utf-8')
      fixtures[file] = JSON.parse(content) as FixtureFile
    }

    return fixtures
  }

  /**
   * Load all fixtures organized by category
   */
  loadAllFixtures(): Record<string, Record<string, FixtureFile>> {
    const allFixtures: Record<string, Record<string, FixtureFile>> = {}

    const categories = readdirSync(this.fixturesDir).filter(name => {
      const stat = statSync(join(this.fixturesDir, name))
      return stat.isDirectory() && !name.startsWith('.')
    })

    for (const category of categories) {
      allFixtures[category] = this.loadCategory(category)
    }

    return allFixtures
  }

  /**
   * Iterator that yields individual test cases
   */
  *iterTests(
    category?: string,
    filename?: string
  ): Generator<{ category: string; filename: string; test: TestCase }> {
    if (category && filename) {
      // Load specific file
      const fixtureData = this.loadFixture(category, filename)
      for (const test of fixtureData.tests) {
        yield { category, filename, test }
      }
    } else if (category) {
      // Load all files in category
      const fixtures = this.loadCategory(category)
      for (const [fname, fixtureData] of Object.entries(fixtures)) {
        for (const test of fixtureData.tests) {
          yield { category, filename: fname, test }
        }
      }
    } else {
      // Load all fixtures
      const allFixtures = this.loadAllFixtures()
      for (const [cat, fixtures] of Object.entries(allFixtures)) {
        for (const [fname, fixtureData] of Object.entries(fixtures)) {
          for (const test of fixtureData.tests) {
            yield { category: cat, filename: fname, test }
          }
        }
      }
    }
  }
}

/**
 * Convenience function to get test cases from a fixture file
 */
export function getTestCases(category: string, filename: string): TestCase[] {
  const loader = new FixtureLoader()
  const fixture = loader.loadFixture(category, filename)
  return fixture.tests
}
