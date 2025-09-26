/**
 * Setup and Teardown Conversion Utilities
 *
 * Utilities for converting Tape setup/teardown test patterns to Node.js test runner
 * before/after hooks and proper test organization.
 */

const { test, describe, before, after, beforeEach, afterEach } = require('node:test')
const { createEnhancedTestContext } = require('./assertion-helpers')

/**
 * Analyzes a test name to determine if it's a setup, teardown, or regular test
 *
 * @param {string} testName - The test name to analyze
 * @returns {string} - 'setup', 'teardown', or 'regular'
 */
function categorizeTest (testName) {
  const lowerName = testName.toLowerCase()

  // Common setup patterns
  if (lowerName.includes('set up') ||
      lowerName.includes('setup') ||
      lowerName.startsWith('start') ||
      lowerName.includes('initialize') ||
      lowerName.includes('init')) {
    return 'setup'
  }

  // Common teardown patterns
  if (lowerName.includes('teardown') ||
      lowerName.includes('tear down') ||
      lowerName.includes('cleanup') ||
      lowerName.includes('clean up') ||
      lowerName.startsWith('end') ||
      lowerName.includes('shutdown') ||
      lowerName.includes('close')) {
    return 'teardown'
  }

  return 'regular'
}

/**
 * Creates a setup/teardown converter with state
 *
 * @returns {Object} - Converter object with methods
 */
function createSetupTeardownConverter () {
  const state = {
    setupTests: [],
    teardownTests: [],
    regularTests: [],
  }

  return {
    /**
     * Adds a test to the appropriate category
     *
     * @param {string} name - Test name
     * @param {Function} testFn - Test function
     */
    addTest (name, testFn) {
      const category = categorizeTest(name)

      switch (category) {
      case 'setup':
        state.setupTests.push({ name, testFn })
        break
      case 'teardown':
        state.teardownTests.push({ name, testFn })
        break
      default:
        state.regularTests.push({ name, testFn })
      }
    },

    /**
     * Converts all collected tests into a proper Node.js test suite
     *
     * @param {string} suiteName - Name for the test suite
     * @returns {Function} - Test suite function
     */
    createTestSuite (suiteName = 'Test Suite') {
      return describe(suiteName, () => {
        // Convert setup tests to before hooks
        state.setupTests.forEach(({ name, testFn }) => {
          before(name, async () => {
            const t = createEnhancedTestContext()
            const result = testFn(t)
            if (result && typeof result.then === 'function') {
              await result
            }
          })
        })

        // Convert regular tests
        state.regularTests.forEach(({ name, testFn }) => {
          test(name, async () => {
            const t = createEnhancedTestContext()
            const result = testFn(t)
            if (result && typeof result.then === 'function') {
              await result
            }
          })
        })

        // Convert teardown tests to after hooks
        state.teardownTests.forEach(({ name, testFn }) => {
          after(name, async () => {
            const t = createEnhancedTestContext()
            const result = testFn(t)
            if (result && typeof result.then === 'function') {
              await result
            }
          })
        })
      })
    },

    /**
     * Resets the converter for reuse
     */
    reset () {
      state.setupTests = []
      state.teardownTests = []
      state.regularTests = []
    },
  }
}

/**
 * Utility functions for common setup/teardown conversion patterns
 */
const conversionUtils = {
  /**
   * Converts a Tape test file that follows the pattern:
   * test('Set up env', ...) -> before hook
   * test('actual tests', ...) -> test cases
   * test('Teardown', ...) -> after hook
   *
   * @param {Array} tests - Array of {name, fn} objects
   * @param {string} suiteName - Optional suite name
   * @returns {Function} - Converted test suite
   */
  convertTestFile: (tests, suiteName) => {
    const converter = createSetupTeardownConverter()

    tests.forEach(({ name, fn }) => {
      converter.addTest(name, fn)
    })

    return converter.createTestSuite(suiteName)
  },

  /**
   * Converts environment setup patterns commonly found in tests
   * Handles process.env modifications and cleanup
   *
   * @param {Function} setupFn - Function that sets up environment
   * @param {Function} teardownFn - Function that cleans up environment
   * @returns {Object} - Before and after hooks
   */
  convertEnvironmentSetup: (setupFn, teardownFn) => {
    return {
      setup: before('Environment setup', async () => {
        const t = createEnhancedTestContext()
        const result = setupFn(t)
        if (result && typeof result.then === 'function') {
          await result
        }
      }),

      teardown: after('Environment teardown', async () => {
        const t = createEnhancedTestContext()
        const result = teardownFn(t)
        if (result && typeof result.then === 'function') {
          await result
        }
      }),
    }
  },

  /**
   * Converts sandbox setup/teardown patterns (common in integration tests)
   *
   * @param {Function} startSandbox - Function to start sandbox
   * @param {Function} endSandbox - Function to end sandbox
   * @returns {Object} - Before and after hooks for sandbox
   */
  convertSandboxSetup: (startSandbox, endSandbox) => {
    return {
      setup: before('Start sandbox', async () => {
        const t = createEnhancedTestContext()
        const result = startSandbox(t)
        if (result && typeof result.then === 'function') {
          await result
        }
      }),

      teardown: after('End sandbox', async () => {
        const t = createEnhancedTestContext()
        const result = endSandbox(t)
        if (result && typeof result.then === 'function') {
          await result
        }
      }),
    }
  },

  /**
   * Handles per-test setup/teardown (beforeEach/afterEach)
   *
   * @param {Function} setupFn - Function to run before each test
   * @param {Function} teardownFn - Function to run after each test
   * @returns {Object} - beforeEach and afterEach hooks
   */
  convertPerTestSetup: (setupFn, teardownFn) => {
    const hooks = {}

    if (setupFn) {
      hooks.beforeEach = beforeEach('Per-test setup', async () => {
        const t = createEnhancedTestContext()
        const result = setupFn(t)
        if (result && typeof result.then === 'function') {
          await result
        }
      })
    }

    if (teardownFn) {
      hooks.afterEach = afterEach('Per-test teardown', async () => {
        const t = createEnhancedTestContext()
        const result = teardownFn(t)
        if (result && typeof result.then === 'function') {
          await result
        }
      })
    }

    return hooks
  },
}

/**
 * Helper for handling callback-based setup/teardown (like sandbox.start/end)
 */
const callbackHelpers = {
  /**
   * Converts callback-based setup to promise-based
   *
   * @param {Function} callbackFn - Function that takes a callback
   * @returns {Function} - Promise-based function
   */
  promisifySetup: (callbackFn) => {
    return () => {
      return new Promise((resolve, reject) => {
        callbackFn((err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })
    }
  },

  /**
   * Converts callback-based teardown to promise-based
   *
   * @param {Function} callbackFn - Function that takes a callback
   * @returns {Function} - Promise-based function
   */
  promisifyTeardown: (callbackFn) => {
    return () => {
      return new Promise((resolve, reject) => {
        callbackFn((err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })
    }
  },
}

module.exports = {
  createSetupTeardownConverter,
  categorizeTest,
  conversionUtils,
  callbackHelpers,
}
