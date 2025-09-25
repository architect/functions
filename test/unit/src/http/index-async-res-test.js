const { join } = require('node:path')
const { brotliDecompressSync, gunzipSync } = require('node:zlib')
const { deepStrictEqual } = require('node:assert')
const sut = join(process.cwd(), 'src')
const test = require('tape')
const sinon = require('sinon')
let arc

const { http: httpFixtures } = require('@architect/req-res-fixtures')
const requests = httpFixtures.req
const responses = httpFixtures.res
const legacyResponses = httpFixtures.legacy.res
const antiCache = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'

const b64dec = (i) => new Buffer.from(i, 'base64').toString()
const str = (i) => JSON.stringify(i)
const match = (copy, item) => `${copy} matches: ${item}`

const responsesTested = []

const copy = (obj) => JSON.parse(JSON.stringify(obj))

const run = async (response, request) => {
  responsesTested.push(response)
  const fn = async () => response
  const handler = arc.http(fn)
  return handler(request)
}

test('Set up env', (t) => {
  t.plan(1)
  // Set env var to keep from stalling on db reads in CI
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'

  arc = require(sut)
  t.ok(arc.http, 'Loaded HTTP')
})

test('Architect v7 (HTTP)', async (t) => {
  t.plan(81)
  const request = requests.arc7.getIndex

  let res = await run(responses.arc7.noReturn, copy(request))
  t.equal(res.body, '', 'Empty body passed')
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.emptyReturn, copy(request))
  t.equal(res.body, '', 'Empty body passed')
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.string, copy(request))
  t.equal(str(responses.arc7.string), res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.object, copy(request))
  t.equal(str(responses.arc7.object), res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.array, copy(request))
  t.equal(str(responses.arc7.array), res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.buffer, copy(request))
  t.equal(str(responses.arc7.buffer), res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.number, copy(request))
  t.equal(str(responses.arc7.number), res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.bodyOnly, copy(request))
  t.equal(responses.arc7.bodyOnly.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.bodyWithStatus, copy(request))
  t.equal(responses.arc7.bodyWithStatus.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.bodyWithStatusAndContentType, copy(request))
  t.equal(responses.arc7.bodyWithStatusAndContentType.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.encodedWithBinaryType, copy(request))
  t.equal(responses.arc7.encodedWithBinaryType.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/pdf/, 'Actual content type returned in header')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.encodedWithCompression, copy(request))
  t.deepEqual(responses.arc7.encodedWithCompression.body, Buffer.from(res.body, 'base64'), match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/pdf/, 'Actual content type returned in header')
  t.match(res.headers['content-encoding'], /^br$/, 'Content encoding set to brotli')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.cookies, copy(request))
  t.equal(responses.arc7.cookies.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(str(responses.arc7.cookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.secureCookies, copy(request))
  t.equal(responses.arc7.secureCookies.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(str(responses.arc7.secureCookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.secureCookieHeader, copy(request))
  t.equal(responses.arc7.secureCookieHeader.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(
    responses.arc7.secureCookieHeader.headers['set-cookie'],
    res.headers['set-cookie'],
    match(`res.headers['set-cookie']`, res.headers['set-cookie']),
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc7.invalid, copy(request))
  t.equal(res.body, '', 'Empty body passed')
  t.equal(responses.arc7.invalid.statusCode, res.statusCode, 'Responded with invalid status code')

  // Compression / encoding
  // br by default
  res = await run(responses.arc7.bodyWithStatus, copy(requests.arc7.getWithBrotli))
  let buf = new Buffer.from(res.body, 'base64')
  t.equal(responses.arc7.bodyWithStatus.body, brotliDecompressSync(buf).toString(), match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.match(res.headers['content-encoding'], /^br$/, 'Content encoding set to brotli')
  t.equal(res.statusCode, 200, 'Responded with 200')

  // Allow manual preference of br
  res = await run(responses.arc7.preferBrCompression, copy(requests.arc7.getWithBrotli))
  buf = new Buffer.from(res.body, 'base64')
  t.equal(responses.arc7.bodyWithStatus.body, brotliDecompressSync(buf).toString(), match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.match(res.headers['content-encoding'], /^br$/, 'Content encoding set to brotli')
  t.equal(res.statusCode, 200, 'Responded with 200')

  // Allow preference of gzip over br
  res = await run(responses.arc7.preferGzipCompression, copy(requests.arc7.getWithBrotli))
  buf = new Buffer.from(res.body, 'base64')
  t.equal(responses.arc7.preferGzipCompression.body, gunzipSync(buf).toString(), match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.match(res.headers['content-encoding'], /^gzip$/, 'Content encoding set to gzip')
  t.equal(res.statusCode, 200, 'Responded with 200')

  // Explicit preference is ignored if agent does not support compression type
  res = await run(responses.arc7.preferGzipCompression, copy(request))
  t.equal(responses.arc7.preferGzipCompression.body, res.body, match('res.body', res.body))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')

  // Client only supports gzip
  res = await run(responses.arc7.bodyWithStatus, copy(requests.arc7.getWithGzip))
  buf = new Buffer.from(res.body, 'base64')
  t.equal(responses.arc7.bodyWithStatus.body, gunzipSync(buf).toString(), match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.match(res.headers['content-encoding'], /^gzip$/, 'Content encoding set to gzip')
  t.equal(res.statusCode, 200, 'Responded with 200')

  // Compression manually disabled
  res = await run(responses.arc7.disableCompression, copy(requests.arc7.getWithBrotli))
  t.equal(responses.arc7.disableCompression.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not set')
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.notOk(res.headers['content-encoding'], 'Content encoding not set')
  t.equal(res.statusCode, 200, 'Responded with 200')
})

test('Architect v6 (REST): dependency-free responses', async (t) => {
  t.plan(35)
  const request = requests.arc6.getIndex

  let res = await run(responses.arc6.body, copy(request))
  t.equal(responses.arc6.body.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.isBase64Encoded, copy(request))
  t.equal(responses.arc6.isBase64Encoded.body, res.body, match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.buffer, copy(request))
  t.ok(typeof res.body === 'string', 'Received string (and not buffer) back')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.encodedWithBinaryTypeBad, copy(request))
  t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.encodedWithBinaryTypeGood, copy(request))
  t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
  t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
  t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.secureCookieHeader, copy(request))
  t.equal(responses.arc6.secureCookieHeader.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  t.equal(
    responses.arc6.secureCookieHeader.headers['set-cookie'],
    res.headers['set-cookie'],
    match(`res.headers['set-cookie']`, res.headers['set-cookie']),
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.secureCookieMultiValueHeader, copy(request))
  t.equal(responses.arc6.secureCookieMultiValueHeader.body, res.body, match('res.body', res.body))
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  t.equal(
    str(responses.arc6.secureCookieMultiValueHeader.multiValueHeaders),
    str(res.multiValueHeaders),
    match('res.multiValueHeaders', str(res.multiValueHeaders)),
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.multiValueHeaders, copy(request))
  t.equal(res.body, '', 'Empty body passed')
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  // Headers object gets mutated, so let's just ensure a header we set is there
  t.equal(
    str(responses.arc6.multiValueHeaders.headers['Set-Cookie']),
    str(res.headers['Set-Cookie']),
    match(`res.headers['Set-Cookie']`, str(res.headers['Set-Cookie'])),
  )
  t.equal(
    str(responses.arc6.multiValueHeaders.multiValueHeaders),
    str(res.multiValueHeaders),
    match('res.multiValueHeaders', str(res.multiValueHeaders)),
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(responses.arc6.invalidMultiValueHeaders, copy(request))
  t.equal(res.body, '', 'Empty body passed')
  t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
  // Headers object gets mutated, so let's just ensure a header we set is there
  t.equal(
    str(responses.arc6.invalidMultiValueHeaders.invalidMultiValueHeaders),
    str(res.invalidMultiValueHeaders),
    match('res.invalidMultiValueHeaders', str(res.invalidMultiValueHeaders)),
  )
  t.equal(res.statusCode, 200, 'Responded with 200')
})

test('Architect v5 (REST): dependency-free responses', async (t) => {
  t.plan(21)
  const request = requests.arc7.getIndex

  let res = await run(legacyResponses.arc5.type, copy(request))
  t.equal(
    legacyResponses.arc5.type.type,
    res.headers['content-type'],
    `type matches res.headers['content-type']: ${res.headers['content-type']}`,
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.cookie, copy(request))
  t.equal(
    res.headers['set-cookie'],
    legacyResponses.arc5.cookie.cookie,
    `Cookie set: ${legacyResponses.arc5.cookie.cookie}...`,
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.secureCookie, copy(request))
  t.equal(
    res.headers['set-cookie'],
    legacyResponses.arc5.secureCookie.cookie,
    `Cookie set: ${legacyResponses.arc5.secureCookie.cookie}...`,
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.secureCookieHeader, copy(request))
  t.equal(
    legacyResponses.arc5.secureCookieHeader.headers['set-cookie'],
    res.headers['set-cookie'],
    match(`res.headers['set-cookie']`, res.headers['set-cookie']),
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.cors, copy(request))
  t.equal(
    res.headers['access-control-allow-origin'],
    '*',
    `CORS boolean set res.headers['access-control-allow-origin'] === '*'`,
  )
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.isBase64Encoded, copy(request))
  t.equal(legacyResponses.arc5.isBase64Encoded.body, res.body, match('res.body', res.body))
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.isBase64EncodedType, copy(request))
  t.equal(legacyResponses.arc5.isBase64EncodedType.body, res.body, match('res.body', res.body))
  t.equal(
    legacyResponses.arc5.isBase64EncodedType.type,
    res.headers['content-type'],
    `type matches res.headers['content-type']: ${res.headers['content-type']}`,
  )
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.isBase64EncodedUnknownCT, copy(request))
  t.equal(legacyResponses.arc5.isBase64EncodedUnknownCT.body, res.body, match('res.body', res.body))
  t.equal(
    legacyResponses.arc5.isBase64EncodedUnknownCT.headers['content-type'],
    res.headers['content-type'],
    match(`res.headers['content-type']`, res.headers['content-type']),
  )
  t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
  t.equal(res.statusCode, 200, 'Responded with 200')
})

test('Architect v5 (REST) + Functions', async (t) => {
  // Arc 5 `arc.http()` functionality backported to `arc.http()`
  t.plan(15)
  const request = requests.arc7.getIndex

  let res = await run(legacyResponses.arc5.body, copy(request))
  t.equal(str(legacyResponses.arc5.body.body), str(res.body), match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.cacheControl, copy(request))
  t.equal(
    legacyResponses.arc5.cacheControl.cacheControl,
    res.headers['cache-control'],
    match(`res.headers['cache-control']`, str(res.headers['cache-control'])),
  )
  if (legacyResponses.arc5.cacheControl.headers['cache-control'] && !res.headers['Cache-Control'])
    t.pass(`Headers normalized and de-duped: ${str(res.headers)}`)
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.noCacheControlHTML, copy(request))
  t.equal(res.headers['cache-control'], antiCache, 'Default anti-caching headers set for HTML response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.noCacheControlJSON, copy(request))
  t.equal(res.headers['cache-control'], antiCache, 'Default anti-caching headers set for JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.noCacheControlJSONapi, copy(request))
  t.equal(res.headers['cache-control'], antiCache, 'Default anti-caching headers set for JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.noCacheControlOther, copy(request))
  const def = 'max-age=86400'
  t.equal(res.headers['cache-control'], def, 'Default caching headers set for non-HTML/JSON response')
  t.equal(res.statusCode, 200, 'Responded with 200')

  res = await run(legacyResponses.arc5.defaultsToJson, copy(request))
  t.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
  t.equal(res.statusCode, 200, 'Responded with 200')
})

/**
 * Ensure the legacy res.type (Arc v5 VTL) param doesn't get set
 * Conditions were:
 * - `!process.env.ARC_CLOUDFORMATION && (!process.env.ARC_HTTP || process.env.ARC_HTTP === 'aws')`
 * - And also not a proxy request: `!req.resource || req?.resource !== '/{proxy+}'`
 */
test('Architect v5 (REST) + Functions do not send res.type', async (t) => {
  t.plan(4)
  const request = requests.arc6.getIndex
  t.ok(request.resource, 'Request a Lambda proxy request')

  const res = await run(legacyResponses.arc5.body, copy(request))
  t.equal(legacyResponses.arc5.body.body, res.body, match('res.body', res.body))
  t.equal(res.statusCode, 200, 'Responded with 200')
  t.notOk(res.type, 'Responded without res.type') // This used to be t.ok, but we removed res.type in v4
})

test('Architect v4 + Functions statically-bound content type responses (HTTP)', async (t) => {
  t.plan(18)
  const request = requests.arc7.getIndex
  const r = legacyResponses.arc4
  const go = async (response, data, contentType) => {
    responsesTested.push(response)
    const res = await run(response, copy(request))
    // Don't double-encode JSON
    if (res.headers['content-type'].includes('json')) {
      t.equal(str(data), res.body, match('res.body', res.body))
    } else {
      t.equal(str(data), str(res.body), match('res.body', res.body))
    }
    t.match(res.headers['content-type'], new RegExp(contentType), `Correct content-type header sent: ${contentType}`)
    t.equal(res.statusCode, 200, 'Responded with 200')
  }
  await go(r.css, r.css.css, 'text/css')
  await go(r.html, r.html.html, 'text/html')
  await go(r.js, r.js.js, 'text/javascript')
  await go(r.json, r.json.json, 'application/json')
  await go(r.text, r.text.text, 'text/plain')
  await go(r.xml, r.xml.xml, 'application/xml')
})

test('Architect v4 + Functions statically-bound content type responses (REST)', async (t) => {
  t.plan(18)
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'
  const request = requests.arc6.getIndex
  const r = legacyResponses.arc4
  const go = async (response, data, contentType) => {
    responsesTested.push(response)
    const res = await run(response, copy(request))
    // Don't double-encode JSON
    if (res.headers['content-type'].includes('json')) {
      t.equal(str(data), res.body, match('res.body', res.body))
    } else {
      t.equal(str(data), str(res.body), match('res.body', res.body))
    }
    t.match(res.headers['content-type'], new RegExp(contentType), `Correct content-type header sent: ${contentType}`)
    t.equal(res.statusCode, 200, 'Responded with 200')
  }
  await go(r.css, r.css.css, 'text/css')
  await go(r.html, r.html.html, 'text/html')
  await go(r.js, r.js.js, 'text/javascript')
  await go(r.json, r.json.json, 'application/json')
  await go(r.text, r.text.text, 'text/plain')
  await go(r.xml, r.xml.xml, 'application/xml')
})

test('Architect <6 + Functions old school response params (HTTP)', async (t) => {
  t.plan(6)
  const request = requests.arc7.getIndex

  let res = await run(legacyResponses.arc.location, copy(request))
  t.equal(legacyResponses.arc.location.location, res.headers.location, match('location', res.headers.location))
  t.equal(res.headers['cache-control'], antiCache, match('cache-control', res.headers['cache-control']))

  res = await run(legacyResponses.arc.status, copy(request))
  t.equal(legacyResponses.arc.status.status, res.statusCode, match('status', res.statusCode))

  res = await run(legacyResponses.arc.code, copy(request))
  t.equal(legacyResponses.arc.code.code, res.statusCode, match('status', res.statusCode))

  res = await run(legacyResponses.arc.statusCode, copy(request))
  t.equal(legacyResponses.arc.statusCode.statusCode, res.statusCode, match('status', res.statusCode))

  res = await run(legacyResponses.arc.session, copy(request))
  t.match(res.headers['set-cookie'], /_idx=/, `Cookie set: ${res.headers['set-cookie'].substr(0, 75)}...`)
})

test('Architect <6 + Functions old school response params (REST)', async (t) => {
  t.plan(6)
  const request = requests.arc6.getIndex

  let res = await run(legacyResponses.arc.location, copy(request))
  t.equal(legacyResponses.arc.location.location, res.headers.location, match('location', res.headers.location))
  t.equal(res.headers['cache-control'], antiCache, match('cache-control', res.headers['cache-control']))

  res = await run(legacyResponses.arc.status, copy(request))
  t.equal(legacyResponses.arc.status.status, res.statusCode, match('status', res.statusCode))

  res = await run(legacyResponses.arc.code, copy(request))
  t.equal(legacyResponses.arc.code.code, res.statusCode, match('status', res.statusCode))

  res = await run(legacyResponses.arc.statusCode, copy(request))
  t.equal(legacyResponses.arc.statusCode.statusCode, res.statusCode, match('status', res.statusCode))

  res = await run(legacyResponses.arc.session, copy(request))
  t.match(res.headers['set-cookie'], /_idx=/, `Cookie set: ${res.headers['set-cookie'].substr(0, 75)}...`)
})

test('Return an error (HTTP)', async (t) => {
  t.plan(2)
  const request = requests.arc7.getIndex
  const error = Error('something bad happened')
  const res = await run(error, copy(request))
  t.equal(res.statusCode, 500, 'Error response, 500 returned')
  t.match(res.body, new RegExp(error.message), `Error response included error message: ${error.message}`)
})

test('Return an error (REST)', async (t) => {
  t.plan(2)
  const request = requests.arc6.getIndex
  const error = Error('something bad happened')
  const res = await run(error, copy(request))
  t.equal(res.statusCode, 500, 'Error response, 500 returned')
  t.match(res.body, new RegExp(error.message), `Error response included error message: ${error.message}`)
})

test('Prevent further middleware from running when a response is returned', (t) => {
  t.plan(1)
  const request = requests.arc7.getIndex
  async function one() {
    return { statusCode: 200 }
  }
  const two = sinon.fake()
  const handler = arc.http(one, two)
  handler(copy(request))
  t.notOk(two.callCount, 'second middleware not called')
})

test('Do not throw if middleware does not return a response (HTTP)', async (t) => {
  t.plan(1)
  const request = requests.arc7.getIndex
  async function one(req) {
    return req
  }
  async function two(req) {
    return req
  }
  const handler = arc.http(one, two)
  try {
    await handler(copy(request))
    t.ok('No exception thrown')
  } catch (err) {
    t.fail(err)
  }
})

test('Throw if middleware does not return a response (REST)', async (t) => {
  t.plan(1)
  const request = requests.arc6.getIndex
  async function one(req) {
    return req
  }
  async function two(req) {
    return req
  }
  const handler = arc.http(one, two)
  try {
    await handler(copy(request))
  } catch (err) {
    t.ok(err, 'exception thrown')
  }
})

test('Verify all Arc v7 (HTTP) + Arc v6 (REST) + legacy response fixtures were tested', (t) => {
  const totalReqs =
    Object.keys(responses.arc7).length +
    Object.keys(responses.arc6).length +
    Object.keys(legacyResponses.arc5).length +
    Object.keys(legacyResponses.arc4).length +
    Object.keys(legacyResponses.arc).length
  t.plan(totalReqs)
  const tester = ([name, req]) => {
    t.ok(
      responsesTested.some((tested) => {
        try {
          deepStrictEqual(req, tested)
          return true
        } catch {
          /* noop */
        }
      }),
      `Tested res: ${name}`,
    )
  }
  console.log('Arc 7 responses')
  Object.entries(responses.arc7).forEach(tester)
  console.log('Arc 6 responses')
  Object.entries(responses.arc6).forEach(tester)
  console.log('Legacy Arc 5 responses')
  Object.entries(legacyResponses.arc5).forEach(tester)
  console.log('Legacy Arc 4 responses')
  Object.entries(legacyResponses.arc4).forEach(tester)
  console.log('Legacy Arc responses')
  Object.entries(legacyResponses.arc).forEach(tester)
})

test('Teardown', (t) => {
  t.plan(1)
  delete process.env.ARC_ENV
  delete process.env.ARC_SESSION_TABLE_NAME
  t.pass('Done')
})
