let test = require('tape')
let proxyquire = require('proxyquire')
let env = process.env.NODE_ENV

let manifestExists = true
let fs = {
  readFileSync: () => (JSON.stringify({
    'foo.png': 'foo-1a2b3d.png'
  })),
  existsSync: () => manifestExists
}
let arcStatic = proxyquire('../../../../src/static', { fs })

function reset () {
  delete process.env.NODE_ENV
  if (process.env.NODE_ENV) throw ReferenceError('NODE_ENV not unset')
}

test('Set up env', t => {
  t.plan(1)
  t.ok(arcStatic, 'Static helper found')
})

test('Local env returns non-fingerprinted path', t => {
  t.plan(3)
  reset()
  manifestExists = true
  process.env.NODE_ENV = 'testing'
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
  process.env.NODE_ENV = 'staging'
  let asset = arcStatic('/')
  t.equal(asset, '/_static/', 'Returned _static path')
})

test('Staging env returns non-fingerprinted path if static manifest is not present', t => {
  t.plan(1)
  reset()
  manifestExists = false
  process.env.NODE_ENV = 'staging'
  let asset = arcStatic('foo.png')
  t.equal(asset, '/_static/foo.png', 'Returned non-fingerprinted path')
})

test('Staging env returns non-fingerprinted path if static manifest is present', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.NODE_ENV = 'staging'
  let asset = arcStatic('foo.png')
  t.equal(asset, '/_static/foo-1a2b3d.png', 'Returned fingerprinted path')
})

test('Staging env returns non-fingerprinted path if static manifest is present', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.NODE_ENV = 'staging'
  t.throws(() => {
    arcStatic('bar.png')
  }, 'Static helper throws error if asset is not found')
})

test('Passing stagePath option adds API Gateway /staging or /production to path', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.NODE_ENV = 'staging'
  let asset = arcStatic('foo.png', { stagePath: true })
  t.equal(asset, '/staging/_static/foo-1a2b3d.png', 'Returned fingerprinted path with API Gateway stage')
})

test('Throws if full manifest requested but doesn\'t exist', t => {
  t.plan(1)
  reset()
  manifestExists = false
  process.env.NODE_ENV = 'staging'
  t.throws(() => {
    arcStatic('', { fullManifest: true })
  }, 'Throws if full manifest requested but doesn\'t exist')
})

test('Requesting full manifest in local environment', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.NODE_ENV = 'testing'
  let asset = arcStatic('foo.png', { fullManifest: true })
  console.log(asset)
  t.ok( asset.path === '/_static' && asset.assets[0] == '/_static/foo.png', 'Requesting full manifest in local environment')
})

test('Requesting full manifest not in local environment', t => {
  t.plan(1)
  reset()
  manifestExists = true
  process.env.NODE_ENV = 'staging'
  let asset = arcStatic('foo.png', { fullManifest: true })
  t.ok(asset.path === '/_static' && asset.assets[0] === '/_static/foo-1a2b3d.png', 'Requesting full manifest not in local environment')
})

test('Reset', t => {
  reset()
  process.env.NODE_ENV = env
  t.end()
})
