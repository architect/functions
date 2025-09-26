/**
 * Test for migration utilities
 *
 * This test verifies that the migration utilities work correctly
 * and can properly convert Tape patterns to Node.js test runner.
 */

const { test, describe } = require('node:test')
const assert = require('node:assert')
const {
  assertionMappers,
  createTapeCompatLayer,
  migrationHelpers,
} = require('./migration-utils')
const {
  enhancedAssertions,
  createEnhancedTestContext,
} = require('./assertion-helpers')
const { SetupTeardownConverter } = require('./setup-teardown-converter')

describe('Migration Utils Tests', () => {
  test('assertionMappers work correctly', () => {
    // Test basic assertion mappings
    assertionMappers.equal(1, 1, 'equal works')
    assertionMappers.ok(true, 'ok works')
    assertionMappers.notOk(false, 'notOk works')

    // Test throws mapping
    assertionMappers.throws(() => {
      throw new Error('test error')
    }, /test error/, 'throws works')

    // Test pass/fail (pass should not throw)
    assertionMappers.pass('pass works')
  })

  test('createTapeCompatLayer provides Tape-like interface', () => {
    const t = createTapeCompatLayer()

    // Should have all assertion methods
    assert.ok(typeof t.equal === 'function', 'has equal method')
    assert.ok(typeof t.deepEqual === 'function', 'has deepEqual method')
    assert.ok(typeof t.ok === 'function', 'has ok method')
    assert.ok(typeof t.throws === 'function', 'has throws method')

    // Should have no-op methods
    assert.ok(typeof t.plan === 'function', 'has plan method')
    assert.ok(typeof t.end === 'function', 'has end method')

    // Test that assertions work
    t.equal(1, 1, 'equal assertion works')
    t.ok(true, 'ok assertion works')
  })

  test('enhancedAssertions provide additional functionality', () => {
    const obj = { foo: 'bar', nested: { value: 42 } }

    // Test enhanced assertions
    enhancedAssertions.hasProperty(obj, 'foo', 'hasProperty works')
    enhancedAssertions.isType('hello', 'string', 'isType works')
    enhancedAssertions.equalStringified(obj, { foo: 'bar', nested: { value: 42 } }, 'equalStringified works')
  })

  test('createEnhancedTestContext combines all features', () => {
    const t = createEnhancedTestContext()

    // Should have basic assertions
    assert.ok(typeof t.equal === 'function', 'has basic equal')
    assert.ok(typeof t.ok === 'function', 'has basic ok')

    // Should have enhanced assertions
    assert.ok(typeof t.hasProperty === 'function', 'has enhanced hasProperty')
    assert.ok(typeof t.isType === 'function', 'has enhanced isType')

    // Should have no-op methods
    assert.ok(typeof t.plan === 'function', 'has plan no-op')
    assert.ok(typeof t.end === 'function', 'has end no-op')

    // Test functionality
    const obj = { test: true }
    t.hasProperty(obj, 'test', 'enhanced assertion works')
    t.equal(1, 1, 'basic assertion works')
  })

  test('SetupTeardownConverter categorizes tests correctly', () => {
    const converter = new SetupTeardownConverter()

    // Test categorization
    assert.strictEqual(converter.categorizeTest('Set up env'), 'setup')
    assert.strictEqual(converter.categorizeTest('Setup database'), 'setup')
    assert.strictEqual(converter.categorizeTest('Initialize system'), 'setup')

    assert.strictEqual(converter.categorizeTest('Teardown'), 'teardown')
    assert.strictEqual(converter.categorizeTest('Clean up resources'), 'teardown')
    assert.strictEqual(converter.categorizeTest('End sandbox'), 'teardown')

    assert.strictEqual(converter.categorizeTest('test feature A'), 'regular')
    assert.strictEqual(converter.categorizeTest('should handle errors'), 'regular')
  })

  test('migrationHelpers.wrapTapeTest works with sync functions', async () => {
    let testRan = false

    const wrappedTest = migrationHelpers.wrapTapeTest((t) => {
      testRan = true
      t.equal(1, 1, 'test assertion')
    })

    await wrappedTest()
    assert.ok(testRan, 'wrapped test executed')
  })

  test('migrationHelpers.wrapTapeTest works with async functions', async () => {
    let testRan = false

    const wrappedTest = migrationHelpers.wrapTapeTest(async (t) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      testRan = true
      t.equal(1, 1, 'async test assertion')
    })

    await wrappedTest()
    assert.ok(testRan, 'wrapped async test executed')
  })
})
