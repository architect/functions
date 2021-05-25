/* eslint require-await: 0 */
let test = require('tape')
let sinon = require('sinon')
let arc = require('../../../../../src')
let requests = require('../http-req-fixtures')
let responses = require('../http-res-fixtures')

let b64dec = i => new Buffer.from(i, 'base64').toString()
let str = i => JSON.stringify(i)
let match = (copy, item) => `${copy} matches: ${item}`

// TODO write error tests

// Deal with Arc 6 specific env vars
let arc6EnvVars = {
  setup: function (t) {
    process.env.ARC_CLOUDFORMATION = true
    process.env.ARC_HTTP = 'aws_proxy'
    if (process.env.ARC_CLOUDFORMATION !== 'true' ||
        process.env.ARC_HTTP !== 'aws_proxy')
      t.fail('Did not populate ARC_CLOUDFORMATION or ARC_HTTP')
  },
  teardown: function (t) {
    delete process.env.ARC_CLOUDFORMATION
    delete process.env.ARC_HTTP
    if (process.env.ARC_CLOUDFORMATION || process.env.ARC_HTTP)
      t.fail('Did not clean ARC_CLOUDFORMATION or ARC_HTTP')
  }
}

let run = async (response, request) => {
  let fn = () => response
  let handler = arc.http.async(fn)
  return handler(request)
}

test('Set up env', t => {
  t.plan(4)
  t.ok(arc.http.async, 'Loaded HTTP async')
  t.ok(arc.http.middleware, 'Loaded HTTP middleware alias')
  t.ok(requests, 'Loaded request fixtures')
  t.ok(responses, 'Loaded response fixtures')
  // Init env var to keep from stalling on db reads in CI
  process.env.SESSION_TABLE_NAME = 'jwe'
})

test('Architect v6 (HTTP)', async t => {
  t.plan(48)
  let request = requests.arc6.http.getIndex
  arc6EnvVars.setup(t)

  let res = await run(responses.arc6.http.noReturn, request)
  t.equal(res.body, '', 'Empty body passed')
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.emptyReturn, request)
  t.equal(res.body, '', 'Empty body passed')
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.string, request)
  t.equal(str(responses.arc6.http.string), res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.object, request)
  t.equal(str(responses.arc6.http.object), res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.array, request)
  t.equal(str(responses.arc6.http.array), res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.buffer, request)
  t.equal(str(responses.arc6.http.buffer), res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.number, request)
  t.equal(str(responses.arc6.http.number), res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.bodyOnly, request)
  t.equal(responses.arc6.http.bodyOnly.body, res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.bodyWithStatus, request)
  t.equal(responses.arc6.http.bodyWithStatus.body, res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.bodyWithStatusAndContentType, request)
  t.equal(responses.arc6.http.bodyWithStatusAndContentType.body, res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.encodedWithBinaryType, request)
  t.equal(responses.arc6.http.encodedWithBinaryType.body, res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/pdf/, 'Actual content type returned in header')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.cookies, request)
  t.equal(responses.arc6.http.cookies.body, res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(str(responses.arc6.http.cookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.secureCookies, request)
  t.equal(responses.arc6.http.secureCookies.body, res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(str(responses.arc6.http.secureCookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.secureCookieHeader, request)
  t.equal(responses.arc6.http.secureCookieHeader.body, res.body, match('res.body', res.body))
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(responses.arc6.rest.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.http.invalid, request)
  t.equal(res.body, '', 'Empty body passed')
  t.equal(responses.arc6.http.invalid.statusCode, res.statusCode, 'Responded with invalid status code')

  arc6EnvVars.teardown(t)
})

test('Architect v6 (REST): dependency-free responses', async t => {
  t.plan(39)
  let request = requests.arc6.rest.getIndex
  arc6EnvVars.setup(t)

  let res = await run(responses.arc6.rest.body, request)
  t.equal(responses.arc6.rest.body.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.isBase64Encoded, request)
  t.equal(responses.arc6.rest.isBase64Encoded.body, res.body, match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.buffer, request)
  t.ok(typeof res.body === 'string', 'Received string (and not buffer) back')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.encodedWithBinaryTypeBad, request)
  t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.encodedWithBinaryTypeGood, request)
  t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.encodedWithBinaryTypeGood, request)
  t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.secureCookieHeader, request)
  t.equal(responses.arc6.rest.secureCookieHeader.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  t.equal(responses.arc6.rest.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.secureCookieMultiValueHeader, request)
  t.equal(responses.arc6.rest.secureCookieMultiValueHeader.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  t.equal(str(responses.arc6.rest.secureCookieMultiValueHeader.multiValueHeaders), str(res.multiValueHeaders), match(`res.multiValueHeaders`, str(res.multiValueHeaders)))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.multiValueHeaders, request)
  t.equal(res.body, '', 'Empty body passed')
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  // Headers object gets mutated, so let's just ensure a header we set is there
  t.equal(str(responses.arc6.rest.multiValueHeaders.headers['Set-Cookie']), str(res.headers['Set-Cookie']), match(`res.headers['Set-Cookie']`, str(res.headers['Set-Cookie'])))
  t.equal(str(responses.arc6.rest.multiValueHeaders.multiValueHeaders), str(res.multiValueHeaders), match(`res.multiValueHeaders`, str(res.multiValueHeaders)))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.rest.invalidMultiValueHeaders, request)
  t.equal(res.body, '', 'Empty body passed')
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  // Headers object gets mutated, so let's just ensure a header we set is there
  t.equal(str(responses.arc6.rest.invalidMultiValueHeaders.invalidMultiValueHeaders), str(res.invalidMultiValueHeaders), match(`res.invalidMultiValueHeaders`, str(res.invalidMultiValueHeaders)))
  t.equal(res.statusCode, 200, 'Responded with 200')

  arc6EnvVars.teardown(t)
})

test('Architect v5 (REST): dependency-free responses', async t => {
  t.plan(21)
  let request = requests.arc5.getIndex

  let res = await run(responses.arc5.type, request)
  t.equal(responses.arc5.type.type, res.headers['Content-Type'], `type matches res.headers['Content-Type']: ${res.headers['Content-Type']}`)
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.cookie, request)
  t.equal(res.headers['Set-Cookie'], responses.arc5.cookie.cookie, `Cookie set: ${responses.arc5.cookie.cookie}...`)
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.secureCookie, request)
  t.equal(res.headers['Set-Cookie'], responses.arc5.secureCookie.cookie, `Cookie set: ${responses.arc5.secureCookie.cookie}...`)
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.secureCookieHeader, request)
  t.equal(responses.arc5.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.cors, request)
  t.equal(res.headers['Access-Control-Allow-Origin'], '*', `CORS boolean set res.headers['Access-Control-Allow-Origin'] === '*'`)
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.isBase64Encoded, request)
  t.equal(responses.arc5.isBase64Encoded.body, res.body, match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.isBase64EncodedType, request)
  t.equal(responses.arc5.isBase64EncodedType.body, res.body, match('res.body', res.body))
  t.equal(responses.arc5.isBase64EncodedType.type, res.headers['Content-Type'], `type matches res.headers['Content-Type']: ${res.headers['Content-Type']}`)
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.isBase64EncodedUnknownCT, request)
  t.equal(responses.arc5.isBase64EncodedUnknownCT.body, res.body, match('res.body', res.body))
  t.equal(responses.arc5.isBase64EncodedUnknownCT.headers['content-type'], res.headers['Content-Type'], match(`res.headers['content-type']`, res.headers['Content-Type']))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')
})

test('Architect v5 (REST) + Functions', async t => {
  // Arc 5 `arc.http()` functionality backported to `arc.http.arc.http.async()`
  t.plan(15)
  let request = requests.arc5.getIndex

  let antiCache = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
  let res = await run(responses.arc5.body, request)
  t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.cacheControl, request)
  t.equal(responses.arc5.cacheControl.cacheControl, res.headers['Cache-Control'], match(`res.headers['Cache-Control']`, str(res.headers['Cache-Control'])))
  if (responses.arc5.cacheControl.headers['cache-control'] && !res.headers['cache-control'])
    t.pass(`Headers normalized and de-duped: ${str(res.headers)}`)
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.noCacheControlHTML, request)
  t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for HTML response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.noCacheControlJSON, request)
  t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.noCacheControlJSONapi, request)
  t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.noCacheControlOther, request)
  let def = 'max-age=86400'
  t.equal(res.headers['Cache-Control'], def, 'Default caching headers set for non-HTML/JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc5.defaultsToJson, request)
  t.match(res.headers['Content-Type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')
})

test('Architect v6 (REST) + Functions + /{proxy+}', async t => {
  t.plan(3)
  let request = requests.arc6.rest.getProxyPlus
  arc6EnvVars.setup(t)

  let res = await run(responses.arc6.rest.body, request)
  t.equal(responses.arc6.rest.body.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')
  arc6EnvVars.teardown(t)
})

test('Architect v5 (REST) + Functions + ARC_HTTP = aws', async t => {
  t.plan(4)
  let request = requests.arc5.getIndex
  process.env.ARC_HTTP = 'aws'
  t.equal(process.env.ARC_HTTP, 'aws', 'Set: ARC_HTTP = aws')

  let res = await run(responses.arc5.body, request)
  t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')
  t.ok(res.type, 'Responded with res.type set with ARC_HTTP = aws')
})

test('Architect v5 (REST) + Functions + ARC_HTTP = aws_proxy', async t => {
  t.plan(4)
  let request = requests.arc5.getIndex
  process.env.ARC_HTTP = 'aws_proxy'
  t.equal(process.env.ARC_HTTP, 'aws_proxy', 'Set: ARC_HTTP = aws_proxy')

  let res = await run(responses.arc5.body, request)
  t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')
  t.notOk(res.type, 'Responded without res.type set with ARC_HTTP = aws_proxy')
})

test('Architect v5 (REST) + Functions + ARC_HTTP = other', async t => {
  t.plan(4)
  let request = requests.arc5.getIndex
  process.env.ARC_HTTP = 'other'
  t.equal(process.env.ARC_HTTP, 'other', 'Set: ARC_HTTP = other')

  let res = await run(responses.arc5.body, request)
  t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')
  t.notOk(res.type, 'Responded without res.type set with ARC_HTTP = other')
})

test('Architect v5 (REST) + Functions + !ARC_HTTP + !ARC_CLOUDFORMATION', async t => {
  t.plan(5)
  let request = requests.arc5.getIndex
  delete process.env.ARC_HTTP
  t.notOk(process.env.ARC_HTTP, 'ARC_HTTP not set')
  t.notOk(process.env.ARC_CLOUDFORMATION, 'ARC_CLOUDFORMATION not set')

  let res = await run(responses.arc5.body, request)
  t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')
  t.ok(res.type, 'Responded with res.type set (default behavior)')
})

test('Architect v5 (REST) + Functions + ARC_CLOUDFORMATION = true', async t => {
  t.plan(5)
  let request = requests.arc5.getIndex
  process.env.ARC_CLOUDFORMATION = true
  t.ok(process.env.ARC_CLOUDFORMATION, 'Set: ARC_CLOUDFORMATION = true')

  let res = await run(responses.arc5.body, request)
  t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')
  t.notOk(res.type, 'Responded without res.type set with ARC_CLOUDFORMATION = true')
  delete process.env.ARC_CLOUDFORMATION
  t.notOk(process.env.ARC_CLOUDFORMATION, 'Unset: ARC_CLOUDFORMATION = true')
})

// Do not test Architect v4 + Functions statically-bound content type responses; arc.middleware introduced in Arc 5

test('Architect <6 response params', async t => {
  t.plan(5)
  let request = requests.arc5.getIndex

  let res = await run(responses.arc.location, request)
  t.equal(responses.arc.location.location, res.headers.Location, match('location', res.headers.Location))

  res = await run(responses.arc.status, request)
  t.equal(responses.arc.status.status, res.statusCode, match('status', res.statusCode))

  res = await run(responses.arc.code, request)
  t.equal(responses.arc.code.code, res.statusCode, match('status', res.statusCode))

  res = await run(responses.arc.statusCode, request)
  t.equal(responses.arc.statusCode.statusCode, res.statusCode, match('status', res.statusCode))

  res = await run(responses.arc.session, request)
  t.match(res.headers['Set-Cookie'], /_idx=/, `Cookie set: ${res.headers['Set-Cookie'].substr(0, 75)}...`)
})

test('Should prevent further middleware from running when a response is returned', t => {
  t.plan(1)
  let request = requests.arc5.getIndex
  function one () { return { statusCode: 200 } }
  let two = sinon.fake()
  let handler = arc.http.async(one, two)
  handler(request)
  t.notOk(two.callCount, 'second middleware not called')
})

test('Should throw if no middleware returns a response', async t => {
  t.plan(1)
  let request = requests.arc5.getIndex
  function one (req) { return req }
  function two (req) { return req }
  let handler = arc.http.async(one, two)
  try {
    await handler(request)
  }
  catch (e) {
    t.ok(e, 'exception thrown')
  }
})

test('Teardown', t => {
  t.plan(1)
  // Unset env var for future testing (ostensibly)
  delete process.env.SESSION_TABLE_NAME
  t.pass('Done')
})
