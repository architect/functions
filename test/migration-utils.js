/**
 * Test Migration Utilities
 *
 * Utilities to help migrate from Tape testing framework to Node.js native test runner.
 * These utilities provide conversion helpers and assertion mappings for consistent migration.
 */

const { test, describe, it, before, after, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert')

/**
 * Assertion mapping helpers - converts Tape assertions to Node.js assert equivalents
 */
const assertionMappers = {
  /**
   * Maps t.equal() to assert.strictEqual()
   */
  equal: (actual, expected, message) => {
    assert.strictEqual(actual, expected, message)
  },

  /**
   * Maps t.deepEqual() to assert.deepStrictEqual()
   */
  deepEqual: (actual, expected, message) => {
    assert.deepStrictEqual(actual, expected, message)
  },

  /**
   * Maps t.ok() to assert.ok()
   */
  ok: (value, message) => {
    assert.ok(value, message)
  },

  /**
   * Maps t.notOk() to assert.ok(!value)
   */
  notOk: (value, message) => {
    assert.ok(!value, message)
  },

  /**
   * Maps t.pass() to assert.ok(true)
   */
  pass: (message) => {
    assert.ok(true, message)
  },

  /**
   * Maps t.fail() to assert.fail()
   */
  fail: (message) => {
    assert.fail(message)
  },

  /**
   * Maps t.throws() to assert.throws()
   */
  throws: (fn, expected, message) => {
    assert.throws(fn, expected, message)
  },

  /**
   * Maps t.doesNotThrow() to assert.doesNotThrow()
   */
  doesNotThrow: (fn, message) => {
    assert.doesNotThrow(fn, message)
  },

  /**
   * Maps t.match() to assert.match()
   */
  match: (string, regexp, message) => {
    assert.match(string, regexp, message)
  },

  /**
   * Maps t.doesNotMatch() to assert.doesNotMatch()
   */
  doesNotMatch: (string, regexp, message) => {
    assert.doesNotMatch(string, regexp, message)
  },

  /**
   * Maps t.equals() (alternative spelling) to assert.strictEqual()
   */
  equals: (actual, expected, message) => {
    assert.strictEqual(actual, expected, message)
  },
}

/**
 * Creates a mock Tape-like test object for easier migration
 * This allows gradual migration by providing Tape-like interface that maps to Node.js assertions
 */
function createTapeCompatLayer () {
  return {
    ...assertionMappers,
    // These methods are no-ops in Node.js test runner (not needed)
    plan: () => {}, // Node.js test runner doesn't use explicit planning
    end: () => {},   // Node.js test runner handles test completion automatically
  }
}

/**
 * Converts a Tape test function to Node.js test runner format
 *
 * @param {string} name - Test name
 * @param {Function} testFn - Tape test function that expects (t) parameter
 * @returns {Function} - Node.js test runner compatible function
 */
function convertTapeTest (name, testFn) {
  return test(name, async () => {
    const t = createTapeCompatLayer()

    // Handle both sync and async test functions
    const result = testFn(t)
    if (result && typeof result.then === 'function') {
      await result
    }
  })
}

/**
 * Converts async Tape test to Node.js test runner format
 *
 * @param {string} name - Test name
 * @param {Function} testFn - Async test function
 * @returns {Function} - Node.js test runner compatible async function
 */
function convertAsyncTapeTest (name, testFn) {
  return test(name, async () => {
    const t = createTapeCompatLayer()
    await testFn(t)
  })
}

/**
 * Setup and teardown conversion utilities
 */
const setupTeardownConverters = {
  /**
   * Converts a Tape setup test to Node.js before hook
   *
   * @param {Function} setupFn - Setup function
   * @returns {Function} - before hook
   */
  convertSetup: (setupFn) => {
    return before(async () => {
      const t = createTapeCompatLayer()
      const result = setupFn(t)
      if (result && typeof result.then === 'function') {
        await result
      }
    })
  },

  /**
   * Converts a Tape teardown test to Node.js after hook
   *
   * @param {Function} teardownFn - Teardown function
   * @returns {Function} - after hook
   */
  convertTeardown: (teardownFn) => {
    return after(async () => {
      const t = createTapeCompatLayer()
      const result = teardownFn(t)
      if (result && typeof result.then === 'function') {
        await result
      }
    })
  },
}

/**
 * Common test patterns converter
 */
const testPatternConverters = {
  /**
   * Converts a test file that follows the common pattern:
   * - Setup test
   * - Multiple test cases
   * - Teardown test
   *
   * @param {Array} tests - Array of test objects with {name, fn, type}
   * @returns {Function} - Converted test suite
   */
  convertTestSuite: (tests) => {
    return describe('Test Suite', () => {
      tests.forEach(({ name, fn, type }) => {
        switch (type) {
        case 'setup':
          setupTeardownConverters.convertSetup(fn)
          break
        case 'teardown':
          setupTeardownConverters.convertTeardown(fn)
          break
        case 'async':
          convertAsyncTapeTest(name, fn)
          break
        default:
          convertTapeTest(name, fn)
        }
      })
    })
  },

  /**
   * Handles the common pattern where tests check for plan completion
   * In Node.js test runner, we don't need explicit planning
   *
   * @param {number} expectedAssertions - Number of expected assertions (ignored)
   * @param {Function} testFn - Test function
   * @returns {Function} - Converted test function
   */
  convertPlannedTest: (expectedAssertions, testFn) => {
    // Node.js test runner doesn't need explicit planning
    // Just run the test function with assertion helpers
    return () => {
      const t = createTapeCompatLayer()
      return testFn(t)
    }
  },
}

/**
 * Utility to help with common migration patterns
 */
const migrationHelpers = {
  /**
   * Wraps a test function to handle common Tape patterns automatically
   *
   * @param {Function} testFn - Original Tape test function
   * @returns {Function} - Wrapped function for Node.js test runner
   */
  wrapTapeTest: (testFn) => {
    return async () => {
      const t = createTapeCompatLayer()

      // Handle the test function
      const result = testFn(t)

      // If it returns a promise, wait for it
      if (result && typeof result.then === 'function') {
        await result
      }
    }
  },

  /**
   * Creates a test context that mimics Tape's behavior
   * Useful for tests that heavily rely on Tape's specific features
   *
   * @returns {Object} - Tape-like test context
   */
  createTestContext: () => {
    return createTapeCompatLayer()
  },

  /**
   * Handles callback-style tests that need to be converted to async/await
   *
   * @param {Function} callbackTest - Test function that uses callbacks
   * @returns {Function} - Promise-based test function
   */
  promisifyCallbackTest: (callbackTest) => {
    return () => {
      return new Promise((resolve, reject) => {
        const t = {
          ...createTapeCompatLayer(),
          end: resolve,
          error: reject,
        }

        try {
          callbackTest(t)
        }
        catch (error) {
          reject(error)
        }
      })
    }
  },
}

module.exports = {
  assertionMappers,
  createTapeCompatLayer,
  convertTapeTest,
  convertAsyncTapeTest,
  setupTeardownConverters,
  testPatternConverters,
  migrationHelpers,

  // Re-export Node.js test utilities for convenience
  test,
  describe,
  it,
  before,
  after,
  beforeEach,
  afterEach,
  assert,
}
