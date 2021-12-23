let test = require('tape')
let url = require('../../../../../src/http/helpers/url')
let env = process.env.ARC_ENV

function reset () {
  delete process.env.ARC_ENV
  delete process.env.ARC_LOCAL
  if (process.env.ARC_ENV) throw ReferenceError('ARC_ENV not unset')
}

test('Set up env', t => {
  t.plan(1)
  t.ok(url, 'url helper found')
})

test('Local (ARC_ENV=testing) env returns unmodified URL', t => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'testing'
  let asset = url('foo.png')
  t.equal(asset, 'foo.png', 'Returned unmodified path')
})

test('Staging env returns staging-prefixed URL', t => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'staging'
  let asset = url('/')
  t.equal(asset, '/staging/', 'Returned staging path')
})

test('Local env with staging mask (ARC_ENV=staging, ARC_LOCAL=1) returns unmodified path', t => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'staging'
  process.env.ARC_LOCAL = '1'
  let asset = url('bar.png')
  t.equal(asset, 'bar.png', 'Returned staging path')
})

test('Production env returns production-prefixed URL', t => {
  t.plan(1)
  reset()
  process.env.ARC_ENV = 'production'
  let asset = url('/')
  t.equal(asset, '/production/', 'Returned staging path')
})

test('Reset', t => {
  reset()
  process.env.ARC_ENV = env
  t.end()
})
