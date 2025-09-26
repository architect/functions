const { test } = require('node:test')
const assert = require('node:assert')
const Module = require('module')

let manifestExists = true

// Mock fs module using Node.js native module mocking
const originalRequire = Module.prototype.require
Module.prototype.require = function (id) {
  if (id === 'fs') {
    return {
      readFileSync: () => JSON.stringify({
        'foo.png': 'foo-1a2b3d.png',
      }),
      existsSync: () => manifestExists,
    }
  }
  return originalRequire.apply(this, arguments)
}

const arcStatic = require('../../../../src/static')

function reset () {
  delete process.env.ARC_ENV
  if (process.env.ARC_ENV) throw ReferenceError('ARC_ENV not unset')
}

test('Set up env', () => {
  assert.ok(arcStatic, 'Static helper found')
})

test('Local env returns non-fingerprinted path', () => {
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'testing'
  let asset = arcStatic('foo.png')
  assert.strictEqual(asset, '/_static/foo.png', 'Returned non-fingerprinted path')
  asset = arcStatic('/foo.png')
  assert.strictEqual(asset, '/_static/foo.png', 'Returned non-fingerprinted path, stripping leading root slash')
  asset = arcStatic('foo.png', { stagePath: true })
  assert.strictEqual(asset, '/_static/foo.png', 'Returned non-fingerprinted path with stagePath option present')
})

test('Staging env returns _static path if root is requested', () => {
  reset()
  manifestExists = false
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('/')
  assert.strictEqual(asset, '/_static/', 'Returned _static path')
})

test('Staging env returns non-fingerprinted path if static manifest is not present', () => {
  reset()
  manifestExists = false
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('foo.png')
  assert.strictEqual(asset, '/_static/foo.png', 'Returned non-fingerprinted path')
})

test('Staging env returns fingerprinted path if static manifest is present', () => {
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('foo.png')
  assert.strictEqual(asset, '/_static/foo-1a2b3d.png', 'Returned fingerprinted path')
})

test('Staging env returns non-fingerprinted path if file is not present in static manifest mapping', () => {
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('bar.png')
  assert.strictEqual(asset, '/_static/bar.png', 'Returned non-fingerprinted path')
})

test('Passing stagePath option adds API Gateway /staging or /production to path', () => {
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('foo.png', { stagePath: true })
  assert.strictEqual(asset, '/staging/_static/foo-1a2b3d.png', 'Returned fingerprinted path with API Gateway stage')
})

test('Reset', () => {
  reset()
})
