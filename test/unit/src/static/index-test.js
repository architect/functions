let test = require('tape')
let proxyquire = require('proxyquire')

let manifestExists = true
let fs = {
  readFileSync: () => (JSON.stringify({
    'foo.png': 'foo-1a2b3d.png'
  })),
  existsSync: () => manifestExists
}
let arcStatic = proxyquire('../../../../src/static', { fs })

function reset () {
  delete process.env.ARC_ENV
  if (process.env.ARC_ENV) throw ReferenceError('ARC_ENV not unset')
}

test('Set up env', t => {
  t.plan(1)
  t.ok(arcStatic, 'Static helper found')
})

test('Local env returns non-fingerprinted path', t => {
  t.plan(3)
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: {}, version: '5.0.0' })
  let asset = arcStatic('foo.png')
  t.equal(asset, '/_static/foo.png', 'Returned non-fingerprinted path')
  asset = arcStatic('/foo.png')
  t.equal(asset, '/_static/foo.png', 'Returned non-fingerprinted path, stripping leading root slash')
  asset = arcStatic('foo.png', { stagePath: true })
  t.equal(asset, '/_static/foo.png', 'Returned non-fingerprinted path with stagePath option present')
})

test('Staging env returns _static path if root is requested', t => {
  t.plan(1)
  reset()
  manifestExists = false
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('/')
  t.equal(asset, '/_static/', 'Returned _static path')
})

test('Staging env returns non-fingerprinted path if static manifest is not present', t => {
  t.plan(1)
  reset()
  manifestExists = false
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('foo.png')
  t.equal(asset, '/_static/foo.png', 'Returned non-fingerprinted path')
})

test('Staging env returns non-fingerprinted path if static manifest is present', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('foo.png')
  t.equal(asset, '/_static/foo-1a2b3d.png', 'Returned fingerprinted path')
})

test('Staging env returns non-fingerprinted path if static manifest is present', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'staging'
  t.throws(() => {
    arcStatic('bar.png')
  }, 'Static helper throws error if asset is not found')
})

test('Passing stagePath option adds API Gateway /staging or /production to path', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.ARC_ENV = 'staging'
  let asset = arcStatic('foo.png', { stagePath: true })
  t.equal(asset, '/staging/_static/foo-1a2b3d.png', 'Returned fingerprinted path with API Gateway stage')
})

test('Reset', t => {
  reset()
  delete process.env.ARC_SANDBOX
  t.end()
})
