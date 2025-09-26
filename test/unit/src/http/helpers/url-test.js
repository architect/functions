let { test } = require('node:test')
let assert = require('node:assert')
let url = require('../../../../../src/http/helpers/url')

function reset () {
  delete process.env.ARC_ENV
  delete process.env.ARC_LOCAL
  if (process.env.ARC_ENV) throw ReferenceError('ARC_ENV not unset')
}

test('Set up env', () => {
  assert.ok(url, 'url helper found')
})

test('Local (ARC_ENV=testing) env returns unmodified URL', () => {
  reset()
  process.env.ARC_ENV = 'testing'
  let asset = url('foo.png')
  assert.strictEqual(asset, 'foo.png', 'Returned unmodified path')
})

test('Staging env returns staging-prefixed URL', () => {
  reset()
  process.env.ARC_ENV = 'staging'
  let asset = url('/')
  assert.strictEqual(asset, '/staging/', 'Returned staging path')
})

test('Local env with staging mask (ARC_ENV=staging, ARC_LOCAL=1) returns unmodified path', () => {
  reset()
  process.env.ARC_ENV = 'staging'
  process.env.ARC_LOCAL = '1'
  let asset = url('bar.png')
  assert.strictEqual(asset, 'bar.png', 'Returned staging path')
})

test('Production env returns production-prefixed URL', () => {
  reset()
  process.env.ARC_ENV = 'production'
  let asset = url('/')
  assert.strictEqual(asset, '/production/', 'Returned staging path')
})

test('Reset', () => {
  reset()
  assert.ok(true, 'Reset complete')
})
