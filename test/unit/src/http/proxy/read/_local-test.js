let test = require('tape')
let readLocal = require('../../../../../../src/http/proxy/read/_local')
let mockfs = require('mock-fs')
let { join } = require('path')
let crypto = require('crypto')

// Stub of static.json
let staticStub = {
  'images/this-is-fine.gif': 'images/this-is-fine-a1c3e5.gif',
  'publicfile.md': 'publicfile-b2d4f6.md'
}

// Generates proxy read requests
function read (params={}) {
  let { Key, IfNoneMatch, isProxy, config, assets } = params
  return {
    Key: Key || 'images/this-is-fine.gif',
    IfNoneMatch: IfNoneMatch || 'abc123',
    isProxy: isProxy || true,
    config: config || { spa: true },
    assets
  }
}

// File contents
let image = Buffer.from('Just imagine some image contents here')
let publicfile = 'This is a file in public/\nCalling to an ![image](${STATIC(\'images/this-is-fine.gif\')})\n'

// Some utilities
let publicPath = join(process.cwd(), 'public')
let hash = thing => crypto.createHash('sha256').update(thing).digest('hex')
let dec = i => Buffer.from(i, 'base64').toString()
function setup () {
  process.env.ARC_SANDBOX_PATH_TO_STATIC = publicPath
}
function reset () {
  mockfs.restore()
}

test('Set up env', t => {
  t.plan(1)
  t.ok(readLocal, 'Loaded readLocal')
})

test('Local proxy reader returns 200', async t => {
  setup()
  t.plan(2)
  // TODO test without path_to_static (legacy mode?)

  mockfs({
    [join(publicPath, 'publicfile.md')]: publicfile
  })
  let params = read({ Key: 'publicfile.md' })
  let result = await readLocal(params)
  t.equal(dec(result.body), publicfile, 'File contents match disk')
  t.equal(result.statusCode, 200, 'File found returns 200')

  reset()
})

test('Local proxy reader returns 404', async t => {
  setup()
  t.plan(2)
  // TODO test without path_to_static (legacy mode?)

  // File not found
  let result = await readLocal(read())
  t.ok(result.body.includes('NoSuchKey'), 'Nonexistent file produces missing file error')
  t.equal(result.statusCode, 404, 'File not found returns 404')

  reset()
})

test('Local proxy reader unsets ARC_STATIC_FOLDER and returns 200', async t => {
  setup()
  t.plan(3)

  // Local reads should unset ARC_STATIC_FOLDER, which is intended for remote/S3 use only
  process.env.ARC_STATIC_FOLDER = 'foobar'
  t.ok(process.env.ARC_STATIC_FOLDER, 'ARC_STATIC_FOLDER set')

  mockfs({
    [join(publicPath, 'publicfile.md')]: publicfile
  })
  let params = read({ Key: 'publicfile.md' })
  let result = await readLocal(params)
  t.equal(dec(result.body), publicfile, 'File contents match disk')
  t.equal(result.statusCode, 200, 'File found returns 200')

  delete process.env.ARC_STATIC_FOLDER
  reset()
})

test('Local proxy reader returns 304 (aka S3 NotModified)', async t => {
  setup()
  t.plan(2)

  mockfs({
    [join(publicPath, 'images/this-is-fine.gif')]: image
  })
  let params = read({ IfNoneMatch: hash(image) })
  let result = await readLocal(params)
  t.equal(result.statusCode, 304, 'Returns statusCode of 304 if ETag matches')
  t.equal(result.headers['ETag'], hash(image) , 'Etag matches request')

  reset()
})

test('Local proxy reader parsed local paths when fingerprinting is enabled', async t => {
  setup()
  t.plan(3)

  // Local reads should remain the same with ARC_STATIC_FOLDER, which is intended for remote/S3 use only
  let filename = 'publicfile.md'
  let img = 'images/this-is-fine.gif'
  process.env.NODE_ENV = 'staging'
  mockfs({
    [join(publicPath, filename)]: publicfile,
    [join(publicPath, img)]: image
  })
  let params = read({ Key: filename, assets: staticStub })
  let result = await readLocal(params)
  t.notEqual(dec(result.body), publicfile, `Contents containing template calls mutated: ${dec(result.body)}`)
  t.ok(dec(result.body).includes(img), `Used non-fingerprinted filename in sandbox mode: ${img}`)
  t.notOk(dec(result.body).includes(staticStub[img]), `Did not use fingerprinted filename in sandbox mode: ${staticStub[img]}`)

  reset()
})
