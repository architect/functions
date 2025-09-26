# Test Migration Guide

This guide explains how to use the migration utilities to convert Tape tests to Node.js native test runner.

## Overview

The migration utilities provide:

1. **Assertion mapping** - Convert Tape assertions to Node.js assert equivalents
2. **Test structure conversion** - Handle setup/teardown patterns
3. **Async test handling** - Proper async/await support
4. **Enhanced assertions** - Additional helpers for complex patterns

## Files

- `migration-utils.js` - Core migration utilities and assertion mappers
- `assertion-helpers.js` - Enhanced assertions for complex patterns
- `setup-teardown-converter.js` - Setup/teardown pattern conversion
- `migration-examples.js` - Usage examples
- `MIGRATION_GUIDE.md` - This documentation

## Basic Usage

### Simple Test Conversion

**Before (Tape):**
```javascript
const test = require('tape')

test('basic test', t => {
  t.plan(2)
  t.equal(1 + 1, 2, 'math works')
  t.ok(true, 'true is truthy')
  t.end()
})
```

**After (Node.js test runner):**
```javascript
const { test } = require('node:test')
const { createEnhancedTestContext } = require('./assertion-helpers')

test('basic test', () => {
  const t = createEnhancedTestContext()
  t.equal(1 + 1, 2, 'math works')
  t.ok(true, 'true is truthy')
  // No need for t.plan() or t.end()
})
```

### Async Test Conversion

**Before (Tape):**
```javascript
test('async test', async t => {
  t.plan(1)
  const result = await someAsyncOperation()
  t.equal(result, 'expected', 'async operation works')
})
```

**After (Node.js test runner):**
```javascript
const { test } = require('node:test')
const assert = require('node:assert')

test('async test', async () => {
  const result = await someAsyncOperation()
  assert.strictEqual(result, 'expected', 'async operation works')
})
```

## Setup/Teardown Conversion

### Manual Conversion

**Before (Tape):**
```javascript
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
```

**After (Node.js test runner):**
```javascript
const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')

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
```

### Using SetupTeardownConverter

```javascript
const { SetupTeardownConverter } = require('./setup-teardown-converter')

const converter = new SetupTeardownConverter()

// Add tests in any order - converter will categorize them
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
converter.createTestSuite('My Test Suite')
```

## Assertion Mapping

| Tape Assertion | Node.js Equivalent | Enhanced Helper |
|---|---|---|
| `t.equal(a, b)` | `assert.strictEqual(a, b)` | `t.equal(a, b)` |
| `t.deepEqual(a, b)` | `assert.deepStrictEqual(a, b)` | `t.deepEqual(a, b)` |
| `t.ok(value)` | `assert.ok(value)` | `t.ok(value)` |
| `t.notOk(value)` | `assert.ok(!value)` | `t.notOk(value)` |
| `t.throws(fn)` | `assert.throws(fn)` | `t.throws(fn)` |
| `t.match(str, regex)` | `assert.match(str, regex)` | `t.match(str, regex)` |
| `t.plan(n)` | *(not needed)* | `t.plan()` *(no-op)* |
| `t.end()` | *(not needed)* | `t.end()` *(no-op)* |

## Enhanced Assertions

The migration utilities provide additional assertions for common patterns:

```javascript
const t = createEnhancedTestContext()

// String comparison with JSON stringification
t.equalStringified(obj1, obj2, 'objects match when stringified')

// Property existence checks
t.hasProperty(obj, 'key', 'object has property')
t.doesNotHaveProperty(obj, 'key', 'object lacks property')

// Type checks
t.isType(value, 'string', 'value is a string')
t.isInstanceOf(obj, Array, 'object is an array')

// Null/undefined checks
t.isNull(value, 'value is null')
t.isUndefined(value, 'value is undefined')

// Array inclusion
t.arrayIncludes(array, item => item.id === 'test', 'array contains matching item')
```

## Common Patterns

### Environment Setup/Teardown

```javascript
const { conversionUtils } = require('./setup-teardown-converter')

const { setup, teardown } = conversionUtils.convertEnvironmentSetup(
  (t) => {
    process.env.ARC_SESSION_TABLE_NAME = 'jwe'
    t.pass('Environment set up')
  },
  (t) => {
    delete process.env.ARC_SESSION_TABLE_NAME
    t.pass('Environment cleaned up')
  }
)
```

### Sandbox Integration

```javascript
const { conversionUtils } = require('./setup-teardown-converter')

const { setup, teardown } = conversionUtils.convertSandboxSetup(
  async (t) => {
    await sandbox.start({ cwd: mock, quiet: true })
    t.pass('Sandbox started')
  },
  async (t) => {
    await sandbox.end()
    t.pass('Sandbox ended')
  }
)
```

### Callback to Promise Conversion

```javascript
const { callbackHelpers } = require('./setup-teardown-converter')

// Convert callback-based function to promise
const promisifiedSetup = callbackHelpers.promisifySetup((callback) => {
  sandbox.start({ cwd: mock, quiet: true }, callback)
})

before('Start sandbox', promisifiedSetup)
```

## Migration Strategy

1. **Start with simple tests** - Convert basic unit tests first
2. **Use the enhanced test context** - Provides Tape-like interface
3. **Handle setup/teardown** - Use the converter utilities
4. **Convert async patterns** - Remove t.plan() and t.end()
5. **Test incrementally** - Verify each converted test works

## File Conversion Workflow

1. **Analyze the test file** - Identify setup, teardown, and regular tests
2. **Choose conversion approach**:
   - Manual conversion for simple files
   - SetupTeardownConverter for complex setup/teardown
   - conversionUtils.convertTestFile for entire file conversion
3. **Update imports** - Change from `require('tape')` to Node.js test imports
4. **Convert test structure** - Apply appropriate conversion pattern
5. **Update assertions** - Use enhanced test context or direct assert calls
6. **Test the conversion** - Run the converted tests to verify functionality

## Tips

- **Remove t.plan()** - Node.js test runner doesn't need explicit planning
- **Remove t.end()** - Tests complete automatically
- **Use async/await** - Preferred over callback patterns
- **Group related tests** - Use describe() blocks for organization
- **Preserve test names** - Keep original test descriptions
- **Handle errors properly** - Use assert.throws() or assert.rejects()

## Troubleshooting

### Common Issues

1. **Tests hang** - Remove t.end() calls, ensure async functions are awaited
2. **Assertion errors** - Check assertion mapping, use enhanced context
3. **Setup/teardown not working** - Verify before/after hook placement
4. **Async tests fail** - Ensure proper async/await usage

### Debug Tips

- Run tests with `--test-reporter=verbose` for detailed output
- Use `console.log()` to debug test flow
- Check that all async operations are properly awaited
- Verify that setup/teardown hooks are in the correct scope