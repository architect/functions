const test = require('tape')
const url = require('../../../../../src/http/helpers/url')

function reset() {
  delete process.env.ARC_ENV
  delete process.env.ARC_LOCAL
  if (process.env.ARC_ENV) throw ReferenceError('ARC_ENV not unset')
}

test('Set up env', (t) => {
  t.plan(1)
  t.ok(url, 'url helper found')
})

test('Local (ARC_ENV=testing) env returns unmodified URL', (t) => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'testing'
  const asset = url('foo.png')
  t.equal(asset, 'foo.png', 'Returned unmodified path')
})

test('Staging env returns staging-prefixed URL', (t) => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'staging'
  const asset = url('/')
  t.equal(asset, '/staging/', 'Returned staging path')
})

test('Local env with staging mask (ARC_ENV=staging, ARC_LOCAL=1) returns unmodified path', (t) => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'staging'
  process.env.ARC_LOCAL = '1'
  const asset = url('bar.png')
  t.equal(asset, 'bar.png', 'Returned staging path')
})

test('Production env returns production-prefixed URL', (t) => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'production'
  const asset = url('/')
  t.equal(asset, '/production/', 'Returned staging path')
})

test('Reset', (t) => {
  reset()
  t.end()
})
