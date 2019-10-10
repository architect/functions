let test = require('tape')
let proxyquire = require('proxyquire')

// S3 stubbing
let enable304
let errorState
let ContentType = 'image/gif'
let ETag = 'etagvalue'
let fileContents = 'this is just some file contents\n'
let options
let S3Stub = {
  S3: function ctor() {
    return {
      getObject: function (opts) {
        options = opts
        if (enable304) return {
          promise: async function () {
            let err = new Error('this will be a 304')
            err.code = 'NotModified'
            throw err
          }
        }
        else if (errorState) return {
          promise: async function () {
            let err = new Error(errorState)
            err.name = errorState
            throw err
          }
        }
       else return {
          promise: async function () {
            return {
              ContentType,
              ETag,
              Body: Buffer.from(fileContents)
            }
          }
        }
      }
    }
  }
}
let sandboxStub = params => {
  params.sandbox = true // Super explicit ensuring return hit sandbox
  return params
}
let staticStub = {
  'images/this-is-fine.gif': 'images/this-is-fine-a1c3e5.gif',
  '@noCallThru': true
}
let read = proxyquire('../../../../../src/http/proxy/read', {
  './sandbox': sandboxStub,
  'fs': {existsSync: () => false},
  'aws-sdk': S3Stub,
})
// Could maybe do this all in a single proxyquire, but having static.json appear in separate call adds extra insurance against any inadvertent static asset manifest requiring and default key fallback
let readStatic = proxyquire('../../../../../src/http/proxy/read', {
  './sandbox': sandboxStub,
  'fs': {existsSync: () => true},
  'aws-sdk': S3Stub,
  '@architect/shared/static.json': staticStub
})
let basicRead = {
  Bucket: 'a-bucket',
  Key: 'this-is-fine.gif',
  IfNoneMatch: 'abc123',
  isProxy: false,
  config: {spa: true}
}
let reset = () => {
  // Make sure options are good!
  options = {}
}

test('Set up env', t => {
  t.plan(1)
  t.ok(read, 'Loaded read')
})

test('Route reads to sandbox', async t => {
  t.plan(4)
  process.env.NODE_ENV = 'testing'
  let result = await read(basicRead)
  t.notOk(process.env.ARC_LOCAL, 'ARC_LOCAL is not set')
  t.ok(result.sandbox, `NODE_ENV = 'testing' runs reads from sandbox`)
  delete process.env.NODE_ENV

  process.env.ARC_LOCAL = true
  t.notOk(process.env.NODE_ENV, 'NODE_ENV is not set')
  result = await read(basicRead)
  t.ok(result.sandbox, `ARC_LOCAL runs reads from sandbox`)
  delete process.env.ARC_LOCAL
})

test('S3 returns NotModified (i.e. respond with 304)', async t => {
  t.plan(2)
  enable304 = true
  let result = await read(basicRead)
  t.equal(result.statusCode, 304, 'Returns statusCode of 304 if ETag matches')
  t.equal(result.headers['ETag'], basicRead.IfNoneMatch, 'Etag matches request')
  enable304 = false
})

test('Throw 500 error on S3 error', async t => {
  t.plan(2)
  errorState = 'this is a random error state'
  let result = await read(basicRead)
  t.equal(result.statusCode, 500, 'Returns statusCode of 500 if S3 errors')
  t.ok(result.body.includes(errorState), 'Error message included in response')
  errorState = false
})

test('Throw 404 error on missing key (aka file not found)', async t => {
  t.plan(2)
  errorState = 'NoSuchKey'
  let result = await read(basicRead)
  t.equal(result.statusCode, 404, 'Returns statusCode of 404 if S3 file is not found')
  t.ok(result.body.includes('Not Found'), 'Error message included in response')
  errorState = false
})

test('S3 returns file; response is normalized & (maybe) transformed', async t => {
  t.plan(5)
  let result = await read(basicRead)
  t.equal(result.headers['Content-Type'], ContentType, 'Returns correct content type')
  t.equal(result.headers['ETag'], ETag, 'Returns correct ETag value')
  t.notOk(result.headers['Cache-Control'].includes('no-cache'), 'Non HTML/JSON file is not anti-cached')
  t.equal(Buffer.from(result.body, 'base64').toString(), fileContents, 'Returns correct body value')
  t.ok(result.isBase64Encoded, 'Result is base64 encoded')
})

test('Fall back to non-fingerprinted when requested file is not found in static manifest', async t => {
  t.plan(2)
  reset()
  await readStatic(basicRead)
  t.equal(options.Bucket, basicRead.Bucket, `Used normal bucket: ${options.Bucket}`)
  t.equal(options.Key, basicRead.Key, `Fall back to non-fingerprinted filename: ${options.Key}`)
})

test('Fingerprinted filename is used when fingerprint is enabled', async t => {
  t.plan(2)
  reset()
  let fingerprintedRead = {
    Bucket: 'a-fingerprinted-bucket',
    Key: 'images/this-is-fine.gif',
    IfNoneMatch: 'abc123',
    isProxy: false,
    config: {spa: true}
  }
  await readStatic(fingerprintedRead)
  t.equal(options.Bucket, fingerprintedRead.Bucket, `Used alternate bucket: ${options.Bucket}`)
  t.equal(options.Key, staticStub[fingerprintedRead.Key], `Read fingerprinted filename: ${options.Key}`)
})
