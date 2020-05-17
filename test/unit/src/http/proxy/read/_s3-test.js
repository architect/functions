let test = require('tape')
let proxyquire = require('proxyquire')

// S3 stubbing
let enable304
let errorState
let ContentType = 'image/gif'
let ETag = 'etagvalue'
let fileContents = 'this is just some file contents\n'

// Response generator
let response
function createResponse(ct, fc, args) {
  response = {
    ContentType: ct || ContentType,
    ETag,
    Body: Buffer.from(fc || fileContents),
  }
  if (args) Object.assign(response, args)
}

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
            return response
          }
        }
      }
    }
  },
  '@noCallThru': true
}

async function prettyStub () {
  return 'pretty'
}

let staticStub = {
  'images/this-is-fine.gif': 'images/this-is-fine-a1c3e5.gif',
  'images/hold-onto-your-butts.gif': 'images/hold-onto-your-butts-b2d4f6.gif',
  'app.js': 'app-a1c3e5.js',
  'index.html': 'index-b2d4f6.html',
  '@noCallThru': true
}
let readS3 = proxyquire('../../../../../../src/http/proxy/read/_s3', {
  'fs': {existsSync: () => false},
  'aws-sdk': S3Stub,
  './_pretty': prettyStub
})
// Could maybe do this all in a single proxyquire, but having static.json appear in separate call adds extra insurance against any inadvertent static asset manifest requiring and default key fallback
let readStatic = proxyquire('../../../../../../src/http/proxy/read/_s3', {
  'fs': {
    existsSync: () => true,
    readFileSync: () => JSON.stringify(staticStub)
  },
  'aws-sdk': S3Stub,
})
let basicRead = {
  Bucket: 'a-bucket',
  Key: 'this-is-fine.gif',
  IfNoneMatch: 'abc123',
  isProxy: true,
  config: {spa: true}
}
let dec = i => Buffer.from(i, 'base64').toString()
let reset = () => {
  // Make sure options are good!
  options = {}
  createResponse()
}

test('Set up env', t => {
  t.plan(2)
  t.ok(readS3, 'Loaded read')
  reset()
  t.ok(response, 'Response ready')
})

test('S3 returns NotModified (i.e. respond with 304)', async t => {
  t.plan(2)
  enable304 = true
  let result = await readS3(basicRead)
  t.equal(result.statusCode, 304, 'Returns statusCode of 304 if ETag matches')
  t.equal(result.headers['ETag'], basicRead.IfNoneMatch, 'Etag matches request')
  enable304 = false
})

test('Return 500 error on S3 error', async t => {
  t.plan(2)
  errorState = 'this is a random error state'
  let result = await readS3(basicRead)
  t.equal(result.statusCode, 500, 'Returns statusCode of 500 if S3 errors')
  t.ok(result.body.includes(errorState), 'Error message included in response')
  errorState = false
})

test('Handed off to pretty URLifier on 404', async t => {
  t.plan(1)
  errorState = 'NoSuchKey'
  let result = await readS3(basicRead)
  t.equal(result, 'pretty', 'Returning from pretty')
  errorState = false
})

test('S3 returns file; response is normalized & (maybe) transformed', async t => {
  t.plan(5)
  let result = await readS3(basicRead)
  t.equal(result.headers['Content-Type'], ContentType, 'Returns correct content type')
  t.equal(result.headers['ETag'], ETag, 'Returns correct ETag value')
  t.notOk(result.headers['Cache-Control'].includes('no-cache'), 'Non HTML/JSON file is not anti-cached')
  t.equal(Buffer.from(result.body, 'base64').toString(), fileContents, 'Returns correct body value')
  t.ok(result.isBase64Encoded, 'Result is base64 encoded')
})

test('S3 files with ContentEncoding property pass through to response headers', async t => {
  t.plan(6)
  reset()
  let ContentEncoding = 'gzip'
  createResponse(null, null, { ContentEncoding })
  let result = await readS3(basicRead)
  t.equal(result.headers['Content-Type'], ContentType, 'Returns correct content type')
  t.equal(result.headers['Content-Encoding'], ContentEncoding, 'Returns correct content encoding')
  t.equal(result.headers['ETag'], ETag, 'Returns correct ETag value')
  t.notOk(result.headers['Cache-Control'].includes('no-cache'), 'Non HTML/JSON file is not anti-cached')
  t.equal(Buffer.from(result.body, 'base64').toString(), fileContents, 'Returns correct body value')
  t.ok(result.isBase64Encoded, 'Result is base64 encoded')
})

test('Fingerprint: fall back to non-fingerprinted file when requested file is not found in static manifest', async t => {
  t.plan(2)
  reset()
  await readStatic(basicRead)
  t.equal(options.Bucket, basicRead.Bucket, `Used normal bucket: ${options.Bucket}`)
  t.equal(options.Key, basicRead.Key, `Fall back to non-fingerprinted filename: ${options.Key}`)
})

test('Fingerprint: filename is passed through / not interpolated for non-captured requests', async t => {
  t.plan(2)
  reset()
  let fingerprintedRead = {
    Bucket: 'a-fingerprinted-bucket',
    Key: 'images/this-is-fine-a1c3e5.gif',
    IfNoneMatch: 'abc123',
    isProxy: true,
    config: {spa: true}
  }
  await readStatic(fingerprintedRead)
  t.equal(options.Bucket, fingerprintedRead.Bucket, `Used alternate bucket: ${options.Bucket}`)
  t.equal(options.Key, fingerprintedRead.Key, `Read fingerprinted filename: ${options.Key}`)
})

test('Fingerprint: filename is interpolated for captured requests (html, json, etc.)', async t => {
  t.plan(3)
  reset()
  createResponse('text/html')
  let fingerprintedRead = {
    Bucket: 'a-fingerprinted-bucket',
    Key: 'index.html',
    IfNoneMatch: 'abc123',
    isProxy: false,
    config: {spa: true}
  }
  let result = await readStatic(fingerprintedRead)
  t.equal(options.Bucket, fingerprintedRead.Bucket, `Used alternate bucket: ${options.Bucket}`)
  t.equal(options.Key, staticStub[fingerprintedRead.Key], `Read fingerprinted filename: ${options.Key}`)
  t.equal(result.body, fileContents, `Original contents not mutated: ${result.body}`)
})

test('Fingerprint: template calls are replaced inline on non-captured requests', async t => {
  t.plan(5)
  reset()
  fileContents = 'this is just some file contents with an image <img src=${STATIC(\'images/this-is-fine.gif\')}>\n and another image <img src=${arc.static(\'images/hold-onto-your-butts.gif\')}> among other things \n'
  createResponse('text/javascript', fileContents)
  let fingerprintedRead = {
    Bucket: 'a-fingerprinted-bucket',
    Key: 'app-a1c3e5.js',
    IfNoneMatch: 'abc123',
    isProxy: true,
    config: {spa: true}
  }
  let result = await readStatic(fingerprintedRead)
  t.equal(options.Bucket, fingerprintedRead.Bucket, `Used alternate bucket: ${options.Bucket}`)
  t.equal(options.Key, fingerprintedRead.Key, `Read fingerprinted filename: ${options.Key}`)
  t.notEqual(fileContents, dec(result.body), `Contents containing template calls mutated: ${dec(result.body)}`)
  t.ok(dec(result.body).includes(staticStub['images/this-is-fine.gif']), `Contents now include fingerprinted asset: ${staticStub['images/this-is-fine.gif']}`)
  t.ok(dec(result.body).includes(staticStub['images/hold-onto-your-butts.gif']), `Contents now include fingerprinted asset: ${staticStub['images/hold-onto-your-butts.gif']}`)
})

test('Fingerprint: template calls are replaced inline on captured requests', async t => {
  t.plan(5)
  reset()
  fileContents = 'this is just some file contents with an image <img src=${STATIC(\'images/this-is-fine.gif\')}>\n and another image <img src=${arc.static(\'images/hold-onto-your-butts.gif\')}> among other things \n'
  createResponse('text/html', fileContents)
  let fingerprintedRead = {
    Bucket: 'a-fingerprinted-bucket',
    Key: 'index.html',
    IfNoneMatch: 'abc123',
    isProxy: false,
    config: {spa: true}
  }
  let result = await readStatic(fingerprintedRead)
  t.equal(options.Bucket, fingerprintedRead.Bucket, `Used alternate bucket: ${options.Bucket}`)
  t.equal(options.Key, staticStub[fingerprintedRead.Key], `Read fingerprinted filename: ${options.Key}`)
  t.notEqual(fileContents, result.body, `Contents containing template calls mutated: ${result.body}`)
  t.ok(result.body.includes(staticStub['images/this-is-fine.gif']), `Contents now include fingerprinted asset: ${staticStub['images/this-is-fine.gif']}`)
  t.ok(result.body.includes(staticStub['images/hold-onto-your-butts.gif']), `Contents now include fingerprinted asset: ${staticStub['images/hold-onto-your-butts.gif']}`)
})
