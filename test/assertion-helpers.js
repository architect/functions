/**
 * Assertion Helpers
 *
 * Specialized assertion helpers for migrating complex Tape assertion patterns
 * to Node.js native test runner equivalents.
 */

const assert = require('node:assert')

/**
 * Enhanced assertion helpers that handle edge cases found in the codebase
 */
const enhancedAssertions = {
  /**
   * Handles string comparison with JSON stringification (common pattern in tests)
   * Equivalent to: t.equal(str(val), str(expected), message)
   */
  equalStringified: (actual, expected, message) => {
    const actualStr = JSON.stringify(actual)
    const expectedStr = JSON.stringify(expected)
    assert.strictEqual(actualStr, expectedStr, message)
  },

  /**
   * Handles property existence checks with better error messages
   * Equivalent to: t.ok(obj.hasOwnProperty(key), message)
   */
  hasProperty: (obj, key, message) => {
    assert.ok(
      Object.prototype.hasOwnProperty.call(obj, key),
      message || `Object should have property: ${key}`,
    )
  },

  /**
   * Handles property absence checks
   * Equivalent to: t.notOk(obj.hasOwnProperty(key), message)
   */
  doesNotHaveProperty: (obj, key, message) => {
    assert.ok(
      !Object.prototype.hasOwnProperty.call(obj, key),
      message || `Object should not have property: ${key}`,
    )
  },

  /**
   * Handles undefined checks with better error messages
   * Equivalent to: t.equal(typeof val, 'undefined', message)
   */
  isUndefined: (value, message) => {
    assert.strictEqual(
      typeof value,
      'undefined',
      message || `Value should be undefined, got: ${typeof value}`,
    )
  },

  /**
   * Handles defined checks
   * Equivalent to: t.notEqual(typeof val, 'undefined', message)
   */
  isDefined: (value, message) => {
    assert.notStrictEqual(
      typeof value,
      'undefined',
      message || `Value should be defined`,
    )
  },

  /**
   * Handles array inclusion checks
   * Equivalent to: t.ok(array.some(predicate), message)
   */
  arrayIncludes: (array, predicate, message) => {
    assert.ok(
      Array.isArray(array) && array.some(predicate),
      message || `Array should include matching element`,
    )
  },

  /**
   * Handles deep equality with better error reporting for complex objects
   * Enhanced version of deepEqual with more detailed failure messages
   */
  deepEqualWithDetails: (actual, expected, message) => {
    try {
      assert.deepStrictEqual(actual, expected, message)
    }
    catch {
      // Enhance error message with more details
      const actualStr = JSON.stringify(actual, null, 2)
      const expectedStr = JSON.stringify(expected, null, 2)
      const enhancedMessage = `${message || 'Deep equality failed'}\nActual:\n${actualStr}\nExpected:\n${expectedStr}`
      throw new Error(enhancedMessage)
    }
  },

  /**
   * Handles async error assertions
   * Equivalent to async version of t.throws()
   */
  rejects: async (asyncFn, expected, message) => {
    await assert.rejects(asyncFn, expected, message)
  },

  /**
   * Handles async non-error assertions
   * Equivalent to async version of t.doesNotThrow()
   */
  doesNotReject: async (asyncFn, message) => {
    await assert.doesNotReject(asyncFn, message)
  },

  /**
   * Handles type checking assertions
   * Equivalent to: t.equal(typeof val, expectedType, message)
   */
  isType: (value, expectedType, message) => {
    assert.strictEqual(
      typeof value,
      expectedType,
      message || `Expected type ${expectedType}, got ${typeof value}`,
    )
  },

  /**
   * Handles instanceof checks
   * Equivalent to: t.ok(obj instanceof Constructor, message)
   */
  isInstanceOf: (obj, Constructor, message) => {
    assert.ok(
      obj instanceof Constructor,
      message || `Object should be instance of ${Constructor.name}`,
    )
  },

  /**
   * Handles null checks
   * Equivalent to: t.equal(val, null, message)
   */
  isNull: (value, message) => {
    assert.strictEqual(value, null, message || `Value should be null`)
  },

  /**
   * Handles non-null checks
   * Equivalent to: t.notEqual(val, null, message)
   */
  isNotNull: (value, message) => {
    assert.notStrictEqual(value, null, message || `Value should not be null`)
  },

  /**
   * Handles truthy checks with better messages
   * Equivalent to: t.ok(val, message)
   */
  isTruthy: (value, message) => {
    assert.ok(value, message || `Value should be truthy, got: ${value}`)
  },

  /**
   * Handles falsy checks with better messages
   * Equivalent to: t.notOk(val, message)
   */
  isFalsy: (value, message) => {
    assert.ok(!value, message || `Value should be falsy, got: ${value}`)
  },
}

/**
 * Specialized helpers for common test patterns found in the codebase
 */
const patternHelpers = {
  /**
   * Helper for testing request/response object properties
   * Common pattern in HTTP tests
   */
  validateRequestObject: (req, expectedKeys, message) => {
    expectedKeys.forEach(key => {
      enhancedAssertions.hasProperty(req, key, `${message}: missing ${key}`)
      enhancedAssertions.isDefined(req[key], `${message}: ${key} is undefined`)
    })
  },

  /**
   * Helper for testing that all items in an array were processed
   * Common pattern in integration tests
   */
  validateAllItemsTested: (testedItems, expectedItems, message) => {
    expectedItems.forEach(expected => {
      const found = testedItems.some(tested => {
        try {
          assert.deepStrictEqual(tested, expected)
          return true
        }
        catch {
          return false
        }
      })
      assert.ok(found, `${message}: ${JSON.stringify(expected)} was not tested`)
    })
  },

  /**
   * Helper for testing error conditions with specific error messages
   * Common pattern for testing thrown errors
   */
  validateErrorMessage: (fn, expectedPattern, message) => {
    try {
      fn()
      assert.fail(`${message}: Expected function to throw`)
    }
    catch (error) {
      if (expectedPattern instanceof RegExp) {
        assert.match(error.message, expectedPattern, message)
      }
      else {
        assert.ok(
          error.message.includes(expectedPattern),
          `${message}: Error message should include "${expectedPattern}", got: ${error.message}`,
        )
      }
    }
  },

  /**
   * Helper for testing async error conditions
   */
  validateAsyncErrorMessage: async (asyncFn, expectedPattern, message) => {
    try {
      await asyncFn()
      assert.fail(`${message}: Expected async function to throw`)
    }
    catch (error) {
      if (expectedPattern instanceof RegExp) {
        assert.match(error.message, expectedPattern, message)
      }
      else {
        assert.ok(
          error.message.includes(expectedPattern),
          `${message}: Error message should include "${expectedPattern}", got: ${error.message}`,
        )
      }
    }
  },
}

/**
 * Migration helper that creates a comprehensive test context
 * with all assertion methods available
 */
function createEnhancedTestContext () {
  return {
    // Basic assertions (from migration-utils.js)
    equal: (actual, expected, message) => assert.strictEqual(actual, expected, message),
    deepEqual: (actual, expected, message) => assert.deepStrictEqual(actual, expected, message),
    ok: (value, message) => assert.ok(value, message),
    notOk: (value, message) => assert.ok(!value, message),
    pass: (message) => assert.ok(true, message),
    fail: (message) => assert.fail(message),
    throws: (fn, expected, message) => assert.throws(fn, expected, message),
    doesNotThrow: (fn, message) => assert.doesNotThrow(fn, message),
    match: (string, regexp, message) => assert.match(string, regexp, message),
    doesNotMatch: (string, regexp, message) => assert.doesNotMatch(string, regexp, message),
    equals: (actual, expected, message) => assert.strictEqual(actual, expected, message),

    // Enhanced assertions
    ...enhancedAssertions,

    // Pattern helpers
    ...patternHelpers,

    // No-op methods for Tape compatibility
    plan: () => {},
    end: () => {},
  }
}

module.exports = {
  enhancedAssertions,
  patternHelpers,
  createEnhancedTestContext,
}
