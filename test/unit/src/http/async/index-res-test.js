/* eslint require-await: 0 */
let test = require('tape')
let sinon = require('sinon')
let arc = require('../../../../../src')
let requests = require('../http-req-fixtures')
let responses = require('../http-res-fixtures')

let b64dec = i => new Buffer.from(i, 'base64').toString()
let str = i => JSON.stringify(i)
let match = (copy, item) => `${copy} matches: ${item}`
let request = requests.arc5.getIndex

// TODO write error tests

test('Set up env', t => {
  t.plan(4)
  t.ok(arc.http.async, 'Loaded HTTP async')
  t.ok(arc.http.middleware, 'Loaded HTTP middleware alias')
  t.ok(requests, 'Loaded request fixtures')
  t.ok(responses, 'Loaded response fixtures')
  // Init env var to keep from stalling on db reads in CI
  process.env.SESSION_TABLE_NAME = 'jwe'
})

test('Architect v6 dependency-free responses', async t => {
  t.plan(11)
  let run = async response => {
    let fn = () => response
    let handler = arc.http.async(fn)
    return handler(request)
  }
  let res = await run(responses.arc6.rest.isBase64Encoded)
  t.equal(responses.arc6.rest.isBase64Encoded.body, res.body, match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc6.rest.buffer)
  t.ok(typeof res.body === 'string', 'Received string (and not buffer) back')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc6.rest.encodedWithBinaryTypeGood)
  t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')
})

test('Architect v5 dependency-free responses', async t => {
  t.plan(6)
  let run = async response => {
    let fn = () => response
    let handler = arc.http.async(fn)
    return handler(request)
  }
  let res = await run(responses.arc5.type)
  t.equal(responses.arc5.type.type, res.headers['Content-Type'], `type matches res.headers['Content-Type']: ${res.headers['Content-Type']}`)
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.cookie)
  t.ok(res.headers['Set-Cookie'].includes('_idx='), `Cookie set: ${res.headers['Set-Cookie'].substr(0, 75)}...`)
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.cors)
  t.equal(res.headers['Access-Control-Allow-Origin'], '*', `CORS boolean set res.headers['Access-Control-Allow-Origin'] === '*'`)
  t.equal(res.statusCode, 200, 'Responded with 200')
  t.end()
})

test('Architect v5 + Functions', async t => {
  // Arc 5 `arc.http()` functionality backported to `arc.http.arc.http.async()`
  t.plan(15)
  let run = async response => {
    let fn = () => response
    let handler = arc.http.async(fn)
    return handler(request)
  }
  let antiCache = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
  let res = await run(responses.arc5.body)
  t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.cacheControl)
  t.equal(responses.arc5.cacheControl.cacheControl, res.headers['Cache-Control'], match(`res.headers['Cache-Control']`, str(res.headers['Cache-Control'])))
  if (responses.arc5.cacheControl.headers['cache-control'] && !res.headers['cache-control'])
    t.pass(`Headers normalized and de-duped: ${str(res.headers)}`)
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.noCacheControlHTML)
  t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for HTML response')
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.noCacheControlJSON)
  t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.noCacheControlJSONapi)
  t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.noCacheControlOther)
  let def = 'max-age=86400'
  t.equal(res.headers['Cache-Control'], def, 'Default caching headers set for non-HTML/JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')
  res = await run(responses.arc5.defaultsToJson)
  t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')
})

// Do not test Architect v4 + Functions statically-bound content type responses; arc.middleware introduced in Arc 5

test('Architect <6 response params', async t => {
  t.plan(4)
  let run = async response => {
    let fn = () => response
    let handler = arc.http.async(fn)
    return handler(request)
  }
  let res = await run(responses.arc.location)
  t.equal(responses.arc.location.location, res.headers.Location, match('location', res.headers.Location))
  res = await run(responses.arc.status)
  t.equal(responses.arc.status.status, res.statusCode, match('status', res.statusCode))
  res = await run(responses.arc.code)
  t.equal(responses.arc.code.code, res.statusCode, match('status', res.statusCode))
  res = await run(responses.arc.statusCode)
  t.equal(responses.arc.statusCode.statusCode, res.statusCode, match('status', res.statusCode))
})

test('arc.middleware should prevent further middleware from running when a response is returned', t => {
  t.plan(1)
  function one () { return { statusCode: 200 } }
  let two = sinon.fake()
  let handler = arc.http.async(one, two)
  handler(request)
  t.notOk(two.callCount, 'second middleware not called')
})

test('arc.middleware should throw if no middleware returns a response', async t => {
  t.plan(1)
  function one (req) { return req }
  function two (req) { return req }
  let handler = arc.http.async(one, two)
  try {
    await handler(request)
  }
  catch (e) {
    t.ok(e, 'exception thrown')
    t.end()
  }
})

test('Teardown', t => {
  t.plan(1)
  // Unset env var for future testing (ostensibly)
  delete process.env.SESSION_TABLE_NAME
  t.pass('Done')
})
