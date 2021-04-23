let test = require('tape')
let mockfs = require('mock-fs')
let proxyquire = require('proxyquire')
let { join } = require('path')
let crypto = require('crypto')
let env = process.env.NODE_ENV

/**
 * We'll test for basic response formatting, templatization, and headers
 *
 * Note: at first glance, it seems like there should be more to test in this method
 * However, deeper testing for content-type, cache-control, etc. are found in other tests, so this should cover pretty much every critical path
 */

// Stubs
// static.json
let staticStub = {
  'images/this-is-fine.gif': 'images/this-is-fine-a1c3e5.gif',
  'publicfile.md': 'publicfile-b2d4f6.md'
}
// eslint-disable-next-line
let prettyStub = async () => 'pretty'

// Generates proxy read requests
function read (params = {}) {
  let { Key, IfNoneMatch, isProxy, config } = params
  return {
    Key: Key || 'images/this-is-fine.gif',
    IfNoneMatch: IfNoneMatch || 'abc123',
    isProxy: isProxy || true,
    config: config || { spa: true },
  }
}

// Some utilities
let publicPath = join(process.cwd(), 'public')
let hash = thing => crypto.createHash('sha256').update(thing).digest('hex')
let dec = i => Buffer.from(i, 'base64').toString()
let b64 = buf => Buffer.from(buf).toString('base64')
function setup () {
  process.env.ARC_SANDBOX_PATH_TO_STATIC = publicPath
}
function reset () {
  process.env.NODE_ENV = env
  mockfs.restore()
}

// File contents
let imgName = 'images/this-is-fine.gif'
let imgContents = Buffer.from('Just imagine some image contents here\n')
let imgContentType = 'image/gif'
let imgETag = hash(imgContents)
/* eslint indent: 0 */
let binary = [
  137, 80, 78, 71,  13,  10,  26,  10,   0,  0, 0, 13,
   73, 72, 68, 82,   0,   0,   0,   1,   0,  0, 0,  1,
    8,  4,  0,  0,   0, 181,  28,  12,   2,  0, 0,  0,
   11, 73, 68, 65,  84, 120, 218,  99, 100, 96, 0,  0,
    0,  6,  0,  2,  48, 129, 208,  47,   0,  0, 0,  0,
   73, 69, 78, 68, 174,  66,  96, 130
]

let mdName = 'some-file.md'
let mdContents = 'This is a file in public/\nCalling to an ![image](${STATIC(\'images/this-is-fine.gif\')})\n'

let defaultCacheControl = 'public, max-age=0, must-revalidate'

// Ok, we're good to go
let readLocal = proxyquire('../../../../../../src/http/proxy/read/_local', {
  './_pretty': prettyStub
})

test('Set up env', t => {
  t.plan(1)
  t.ok(readLocal, 'Loaded readLocal')
})

test('Local proxy reader returns formatted response from text payload (200)', async t => {
  setup()
  t.plan(6)
  // TODO test without path_to_static (legacy mode?)

  mockfs({
    [join(publicPath, imgName)]: imgContents
  })
  let result = await readLocal(read())
  t.equal(result.statusCode, 200, 'Returns statusCode: 200')
  t.equal(result.headers['Cache-Control'], defaultCacheControl, 'Returns correct cache-control')
  t.equal(result.headers['Content-Type'], imgContentType, 'Returns correct content-type')
  t.equal(result.headers['ETag'], imgETag, 'Returns correct ETag')
  t.equal(result.body, b64(imgContents), 'Returns correct body')
  t.ok(result.isBase64Encoded, 'Returns isBase64Encoded: true')
  reset()
})

test('Local proxy reader returns formatted response from binary payload (200)', async t => {
  setup()
  t.plan(2)

  mockfs({
    [join(publicPath, imgName)]: Buffer.from(binary)
  })
  let result = await readLocal(read())
  t.equal(result.headers['ETag'], hash(Buffer.from(binary)), 'Returns correct ETag')
  t.equal(result.body, b64(binary), 'Returns correct body')
  reset()
})

test('Local proxy reader unsets ARC_STATIC_PREFIX and returns formatted response (200)', async t => {
  setup()
  t.plan(7)

  // Local reads should unset ARC_STATIC_PREFIX, which is intended for remote/S3 use only
  process.env.ARC_STATIC_PREFIX = 'foobar'
  t.ok(process.env.ARC_STATIC_PREFIX, 'ARC_STATIC_PREFIX set')

  mockfs({
    [join(publicPath, imgName)]: imgContents
  })
  let params = read({ Key: `${process.env.ARC_STATIC_PREFIX}/${imgName}` })
  let result = await readLocal(params)
  t.equal(result.statusCode, 200, 'Returns statusCode: 200')
  t.equal(result.headers['Cache-Control'], defaultCacheControl, 'Returns correct cache-control')
  t.equal(result.headers['Content-Type'], imgContentType, 'Returns correct content-type')
  t.equal(result.headers['ETag'], imgETag, 'Returns correct ETag')
  t.equal(result.body, b64(imgContents), 'Returns correct body')
  t.ok(result.isBase64Encoded, 'Returns isBase64Encoded: true')
  delete process.env.ARC_STATIC_PREFIX
  reset()
})

test('Local proxy reader unsets ARC_STATIC_FOLDER (deprecated) and returns formatted response (200)', async t => {
  setup()
  t.plan(7)

  // Local reads should unset ARC_STATIC_FOLDER, which is intended for remote/S3 use only
  process.env.ARC_STATIC_FOLDER = 'foobar'
  t.ok(process.env.ARC_STATIC_FOLDER, 'ARC_STATIC_FOLDER set')

  mockfs({
    [join(publicPath, imgName)]: imgContents
  })
  let params = read({ Key: `${process.env.ARC_STATIC_FOLDER}/${imgName}` })
  let result = await readLocal(params)
  t.equal(result.statusCode, 200, 'Returns statusCode: 200')
  t.equal(result.headers['Cache-Control'], defaultCacheControl, 'Returns correct cache-control')
  t.equal(result.headers['Content-Type'], imgContentType, 'Returns correct content-type')
  t.equal(result.headers['ETag'], imgETag, 'Returns correct ETag')
  t.equal(result.body, b64(imgContents), 'Returns correct body')
  t.ok(result.isBase64Encoded, 'Returns isBase64Encoded: true')
  delete process.env.ARC_STATIC_FOLDER
  reset()
})

test('Local proxy reader returns 304 (aka S3 NotModified)', async t => {
  setup()
  t.plan(2)

  mockfs({
    [join(publicPath, imgName)]: imgContents
  })
  let params = read({ IfNoneMatch: hash(imgContents) })
  let result = await readLocal(params)
  t.equal(result.statusCode, 304, 'Returns statusCode of 304 if ETag matches')
  t.equal(result.headers['ETag'], hash(imgContents), 'Etag matches request')
  reset()
})

test('Local proxy reader templatizes with local paths when fingerprinting is enabled', async t => {
  // Tests to ensure ${ARC_STATIC('foo.gif')} doesn't use fingerprinted filenames locally
  setup()
  t.plan(3)

  process.env.NODE_ENV = 'staging'
  mockfs({
    [join(publicPath, mdName)]: mdContents,
    [join(publicPath, imgName)]: imgContents
  })
  let params = read({ Key: mdName, config: { assets: staticStub } })
  let result = await readLocal(params)
  t.notEqual(result.body, b64(mdContents), `Contents containing template calls mutated: ${dec(result.body)}`)
  t.ok(dec(result.body).includes(imgName), `Used non-fingerprinted filename in sandbox mode: ${imgName}`)
  t.notOk(dec(result.body).includes(staticStub[imgName]), `Did not use fingerprinted filename in sandbox mode: ${staticStub[imgName]}`)
  reset()
})

test('Local proxy reader hands off to pretty URLifier on 404', async t => {
  // We'll let the pretty / 404 tests handle whether a 404 is actually returned
  t.plan(1)
  let result = await readLocal(read())
  t.equal(result, 'pretty', 'File not found returns response from pretty')
})
