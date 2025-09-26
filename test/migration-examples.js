/**
 * Migration Examples
 *
 * Examples showing how to use the migration utilities to convert Tape tests
 * to Node.js native test runner format.
 */

const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
const { join } = require('path')
const {
  migrationHelpers,
} = require('./migration-utils')
const { createEnhancedTestContext } = require('./assertion-helpers')
const { conversionUtils } = require('./setup-teardown-converter')

const mock = join(__dirname, 'mock', 'project')

/**
 * Example 1: Basic Tape test conversion
 */
function exampleBasicConversion () {
  // BEFORE (Tape):
  /*
  const test = require('tape')

  test('basic test', t => {
    t.plan(2)
    t.equal(1 + 1, 2, 'math works')
    t.ok(true, 'true is truthy')
    t.end()
  })
  */

  // AFTER (Node.js test runner):
  test('basic test', () => {
    const t = createEnhancedTestContext()
    t.equal(1 + 1, 2, 'math works')
    t.ok(true, 'true is truthy')
    // No need for t.plan() or t.end()
  })
}

/**
 * Example 2: Async test conversion
 */
function exampleAsyncConversion () {
  // BEFORE (Tape):
  /*
  test('async test', async t => {
    t.plan(1)
    const result = await someAsyncOperation()
    t.equal(result, 'expected', 'async operation works')
  })
  */

  // AFTER (Node.js test runner):
  test('async test', async () => {
    const result = await someAsyncOperation()
    assert.strictEqual(result, 'expected', 'async operation works')
  })
}

/**
 * Example 3: Setup/Teardown conversion
 */
function exampleSetupTeardownConversion () {
  // BEFORE (Tape):
  /*
  test('Set up env', t => {
    t.plan(1)
    process.env.TEST_VAR = 'test'
    t.pass('Environment set up')
  })

  test('actual test', t => {
    t.plan(1)
    t.equal(process.env.TEST_VAR, 'test', 'env var is set')
  })

  test('Teardown', t => {
    t.plan(1)
    delete process.env.TEST_VAR
    t.pass('Environment cleaned up')
  })
  */

  // AFTER (Node.js test runner):
  describe('Test Suite', () => {
    before('Set up env', () => {
      process.env.TEST_VAR = 'test'
    })

    test('actual test', () => {
      assert.strictEqual(process.env.TEST_VAR, 'test', 'env var is set')
    })

    after('Teardown', () => {
      delete process.env.TEST_VAR
    })
  })
}

/**
 * Example 4: Using the SetupTeardownConverter
 */
function exampleUsingConverter () {
  const { createSetupTeardownConverter } = require('./setup-teardown-converter')
  const converter = createSetupTeardownConverter()

  // Add tests in any order
  converter.addTest('Set up env', (t) => {
    process.env.TEST_VAR = 'test'
    t.pass('Environment set up')
  })

  converter.addTest('test something', (t) => {
    t.equal(process.env.TEST_VAR, 'test', 'env var is set')
  })

  converter.addTest('Teardown', (t) => {
    delete process.env.TEST_VAR
    t.pass('Environment cleaned up')
  })

  // Create the test suite
  return converter.createTestSuite('My Test Suite')
}

/**
 * Example 5: Complex assertion patterns
 */
function exampleComplexAssertions () {
  // BEFORE (Tape):
  /*
  test('complex assertions', t => {
    t.plan(5)
    const obj = { foo: 'bar', nested: { value: 42 } }

    t.ok(obj.hasOwnProperty('foo'), 'has foo property')
    t.equal(JSON.stringify(obj), JSON.stringify({ foo: 'bar', nested: { value: 42 } }), 'objects match')
    t.throws(() => { throw new Error('test error') }, /test error/, 'throws expected error')
    t.match('hello world', /world/, 'string matches pattern')
    t.deepEqual(obj.nested, { value: 42 }, 'nested object matches')
  })
  */

  // AFTER (Node.js test runner):
  test('complex assertions', () => {
    const t = createEnhancedTestContext()
    const obj = { foo: 'bar', nested: { value: 42 } }

    t.hasProperty(obj, 'foo', 'has foo property')
    t.equalStringified(obj, { foo: 'bar', nested: { value: 42 } }, 'objects match')
    t.throws(() => { throw new Error('test error') }, /test error/, 'throws expected error')
    t.match('hello world', /world/, 'string matches pattern')
    t.deepEqual(obj.nested, { value: 42 }, 'nested object matches')
  })
}

/**
 * Example 6: Sandbox integration test pattern
 */
function exampleSandboxIntegration () {
  // BEFORE (Tape):
  /*
  const sandbox = require('@architect/sandbox')

  test('Start sandbox', async t => {
    t.plan(1)
    await sandbox.start({ cwd: mock, quiet: true })
    t.pass('Sandbox started')
  })

  test('test with sandbox', t => {
    // test logic here
  })

  test('End sandbox', async t => {
    t.plan(1)
    await sandbox.end()
    t.pass('Sandbox ended')
  })
  */

  // AFTER (Node.js test runner):
  describe('Sandbox Integration Tests', () => {
    before('Start sandbox', async () => {
      const sandbox = require('@architect/sandbox')
      await sandbox.start({ cwd: mock, quiet: true })
    })

    test('test with sandbox', () => {
      // test logic here
    })

    after('End sandbox', async () => {
      const sandbox = require('@architect/sandbox')
      await sandbox.end()
    })
  })
}

/**
 * Example 7: Using migration helpers for gradual conversion
 */
function exampleGradualMigration () {
  // You can use the migration helpers to convert tests gradually

  // Wrap existing Tape test functions
  const wrappedTest = migrationHelpers.wrapTapeTest((t) => {
    t.plan(2)
    t.equal(1 + 1, 2, 'math works')
    t.ok(true, 'true is truthy')
    t.end()
  })

  test('wrapped tape test', wrappedTest)
}

/**
 * Example 8: Converting callback-based tests
 */
function exampleCallbackConversion () {
  // BEFORE (Tape with callbacks):
  /*
  test('callback test', t => {
    t.plan(1)
    someCallbackFunction((err, result) => {
      t.notOk(err, 'no error')
      t.equal(result, 'expected', 'result is correct')
      t.end()
    })
  })
  */

  // AFTER (Node.js test runner with promises):
  test('callback test', async () => {
    const result = await new Promise((resolve, reject) => {
      someCallbackFunction((err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })

    assert.strictEqual(result, 'expected', 'result is correct')
  })
}

/**
 * Example 9: File-level conversion using conversionUtils
 */
function exampleFileConversion () {
  // Define all your tests as an array
  const tests = [
    {
      name: 'Set up env',
      fn: (t) => {
        process.env.TEST_VAR = 'test'
        t.pass('Environment set up')
      },
    },
    {
      name: 'test feature A',
      fn: (t) => {
        t.equal(process.env.TEST_VAR, 'test', 'env var is set')
      },
    },
    {
      name: 'test feature B',
      fn: (t) => {
        t.ok(true, 'feature B works')
      },
    },
    {
      name: 'Teardown',
      fn: (t) => {
        delete process.env.TEST_VAR
        t.pass('Environment cleaned up')
      },
    },
  ]

  // Convert the entire file
  return conversionUtils.convertTestFile(tests, 'My Test File')
}

// Mock function for examples
async function someAsyncOperation () {
  return 'expected'
}

function someCallbackFunction (callback) {
  setTimeout(() => callback(null, 'expected'), 10)
}

module.exports = {
  exampleBasicConversion,
  exampleAsyncConversion,
  exampleSetupTeardownConversion,
  exampleUsingConverter,
  exampleComplexAssertions,
  exampleSandboxIntegration,
  exampleGradualMigration,
  exampleCallbackConversion,
  exampleFileConversion,
}
