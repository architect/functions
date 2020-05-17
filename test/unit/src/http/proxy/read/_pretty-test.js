let test = require('tape')
let mockfs = require('mock-fs')
let proxyquire = require('proxyquire')
let env = process.env.NODE_ENV
// Tried to use 'aws-sdk-mock', wasn't able to get it working with aws.whatever().promise()

let errorState
let buf = msg => Buffer.from(msg)
let S3Stub = {
  S3: function ctor() {
    return {
      getObject: function () {
        if (isFolder && Key === 'ok/hi') {
          return {
            promise: async function () {
              return { Body: buf(`peeked ok from S3!`) }
            }
          }
        }
        if (isFolder && Key === 'notOk') {
          return {
            promise: async function () {
              let err = new Error(errorState)
              err.name = errorState
              throw err
            }
          }
        }
        if (Key === 'getCustom404') {
          return {
            promise: async function () {
              return { Body: buf('custom 404 from S3!') }
            }
          }
        }
        return {
          promise: async function () {
            let err = new Error(errorState)
            err.name = errorState
            throw err
          }
        }
      }
    }
  },
  '@noCallThru': true
}

let reset = () => {
  Key = isFolder = errorState = undefined
}

let pretty = proxyquire('../../../../../../src/http/proxy/read/_pretty', {
  'aws-sdk': S3Stub
})

let Key
let isFolder
let Bucket = 'a-bucket'
let headers = {}
let config = {}

test('Set up env', t => {
  t.plan(1)
  mockfs({
    'ok/hi': {
      'index.html': buf(`peeked ok from local!`)
    }
  })
  t.ok(pretty, 'Loaded pretty')
})

test('Peek and find nested index.html', async t => {
  t.plan(2)
  // AWS
  process.env.NODE_ENV = 'staging'
  Key = 'ok/hi'
  isFolder = true
  let result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  t.equal(result.body, 'peeked ok from S3!', 'Successfully peeked into an S3 folder without a trailing slash')

  // Local
  process.env.NODE_ENV = 'testing'
  result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  reset()
  t.equal(result.body, 'peeked ok from local!', 'Successfully peeked into a local folder without a trailing slash')
})

test('Peek and do not find nested index.html', async t => {
  t.plan(4)
  // AWS
  process.env.NODE_ENV = 'staging'
  Key = 'notOk',
  isFolder = true
  errorState = 'NoSuchKey'
  let result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  t.equal(result.statusCode, 404, 'Returns statusCode of 404 if S3 file is not found')
  t.ok(result.body.includes('NoSuchKey'), 'Error message included in response from S3')

  // Local
  process.env.NODE_ENV = 'testing'
  result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  reset()
  t.equal(result.statusCode, 404, 'Returns statusCode of 404 if local file is not found')
  t.ok(result.body.includes('NoSuchKey'), 'Error message included in response from local')
})

test('Return a custom 404', async t => {
  t.plan(4)
  // AWS
  process.env.NODE_ENV = 'staging'
  Key = 'getCustom404'
  let result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  t.equal(result.statusCode, 404, 'Returns statusCode of 404 with custom 404 error from S3')
  t.ok(result.body.includes('custom 404 from S3!'), 'Output is custom 404 page from S3')

  // Local
  process.env.NODE_ENV = 'testing'
  // Update mockfs to find a 404
  mockfs({ '404.html': buf(`custom 404 from local!`) })
  result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  reset()
  t.equal(result.statusCode, 404, 'Returns statusCode of 404 with custom 404 error from local')
  t.ok(result.body.includes('custom 404 from local!'), 'Output is custom 404 page from local')
})

test('Return the default 404', async t => {
  t.plan(4)
  // AWS
  process.env.NODE_ENV = 'staging'
  Key = 'cantfindme'
  errorState = 'NoSuchKey'
  let result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  t.equal(result.statusCode, 404, 'Returns statusCode of 404 if S3 file is not found')
  t.ok(result.body.includes('NoSuchKey'), 'Error message included in response from S3')

  // Local
  process.env.NODE_ENV = 'staging'
  // Update mockfs to find a nothing
  mockfs({})
  Key = 'cantfindme'
  errorState = 'NoSuchKey'
  result = await pretty({
    Bucket,
    Key,
    headers,
    isFolder,
    config
  })
  reset()
  t.equal(result.statusCode, 404, 'Returns statusCode of 404 if local file is not found')
  t.ok(result.body.includes('NoSuchKey'), 'Error message included in response from local')
})

test('Teardown', t => {
  process.env.NODE_ENV = env
  mockfs.restore()
  t.pass('Ok')
  t.end()
})
