let { join } = require('path')
let { brotliDecompressSync, gunzipSync } = require('zlib')
let { deepStrictEqual } = require('assert')
let sut = join(process.cwd(), 'src')
let { test } = require('node:test')
let assert = require('node:assert')
let http

let { http: httpFixtures } = require('@architect/req-res-fixtures')
let requests = httpFixtures.req
let responses = httpFixtures.res
let legacyResponses = httpFixtures.legacy.res
let antiCache = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'

let b64dec = i => new Buffer.from(i, 'base64').toString()
let str = i => JSON.stringify(i)
let match = (copy, item) => `${copy} matches: ${item}`

let responsesTested = []

let copy = obj => JSON.parse(JSON.stringify(obj))

let run = (response, request, callback) => {
  responsesTested.push(response)
  let handler = http((req, res) => res(response))
  handler(request, {}, callback)
}

test('Set up env', () => {
  // Init env var to keep from stalling on db reads in CI
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'

  let arc = require(sut)
  http = arc.http
  assert.ok(http, 'Loaded HTTP')
})

test('Architect v7 (HTTP)', () => {
  let request = requests.arc7.getIndex
  run(responses.arc7.noReturn, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.body, '', 'Empty body passed')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.emptyReturn, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.body, '', 'Empty body passed')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.string, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(str(responses.arc7.string), res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.object, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(str(responses.arc7.object), res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.array, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(str(responses.arc7.array), res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.buffer, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(str(responses.arc7.buffer), res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.number, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(str(responses.arc7.number), res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.bodyOnly, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.bodyOnly.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.bodyWithStatus, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.bodyWithStatus.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.bodyWithStatusAndContentType, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.bodyWithStatusAndContentType.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.encodedWithBinaryType, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.encodedWithBinaryType.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/pdf/, 'Passed correct content-type')
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.encodedWithCompression, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.deepStrictEqual(responses.arc7.encodedWithCompression.body, Buffer.from(res.body, 'base64'), match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/pdf/, 'Passed correct content-type')
    assert.match(res.headers['content-encoding'], /^br$/, 'Content encoding set to brotli')
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.cookies, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.cookies.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(str(responses.arc7.cookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.secureCookies, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.secureCookies.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(str(responses.arc7.secureCookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.secureCookieHeader, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.secureCookieHeader.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(responses.arc7.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc7.invalid, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.body, '', 'Empty body passed')
    assert.strictEqual(responses.arc7.invalid.statusCode, res.statusCode, 'Responded with invalid status code')
  })
  // Compression / encoding
  // br by default
  run(responses.arc7.bodyWithStatus, copy(requests.arc7.getWithBrotli), (err, res) => {
    assert.ok(!err, 'No error')
    let buf = new Buffer.from(res.body, 'base64')
    assert.strictEqual(responses.arc7.bodyWithStatus.body, brotliDecompressSync(buf).toString(), match('res.body', res.body))
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.match(res.headers['content-encoding'], /^br$/, 'Content encoding set to brotli')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  // Allow manual preference of br
  run(responses.arc7.preferBrCompression, copy(requests.arc7.getWithBrotli), (err, res) => {
    assert.ok(!err, 'No error')
    let buf = new Buffer.from(res.body, 'base64')
    assert.strictEqual(responses.arc7.bodyWithStatus.body, brotliDecompressSync(buf).toString(), match('res.body', res.body))
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.match(res.headers['content-encoding'], /^br$/, 'Content encoding set to brotli')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  // Allow preference of gzip over br
  run(responses.arc7.preferGzipCompression, copy(requests.arc7.getWithBrotli), (err, res) => {
    assert.ok(!err, 'No error')
    let buf = new Buffer.from(res.body, 'base64')
    assert.strictEqual(responses.arc7.preferGzipCompression.body, gunzipSync(buf).toString(), match('res.body', res.body))
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.match(res.headers['content-encoding'], /^gzip$/, 'Content encoding set to gzip')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  // Explicit preference is ignored if agent does not support compression type
  run(responses.arc7.preferGzipCompression, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.preferGzipCompression.body, res.body, match('res.body', res.body))
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  // Client only supports gzip
  run(responses.arc7.bodyWithStatus, copy(requests.arc7.getWithGzip), (err, res) => {
    assert.ok(!err, 'No error')
    let buf = new Buffer.from(res.body, 'base64')
    assert.strictEqual(responses.arc7.bodyWithStatus.body, gunzipSync(buf).toString(), match('res.body', res.body))
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.match(res.headers['content-encoding'], /^gzip$/, 'Content encoding set to gzip')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  // Compression manually disabled
  run(responses.arc7.disableCompression, copy(requests.arc7.getWithBrotli), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc7.disableCompression.body, res.body, match('res.body', res.body))
    assert.ok(!res.isBase64Encoded, 'isBase64Encoded param not set')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.ok(!res.headers['content-encoding'], 'Content encoding not set')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
})

test('Architect v6 (REST): dependency-free responses', () => {
  let request = requests.arc6.getIndex

  run(responses.arc6.body, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc6.body.body, res.body, match('res.body', res.body))
    assert.ok(!res.isBase64Encoded, 'isBase64Encoded param not passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.isBase64Encoded, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc6.isBase64Encoded.body, res.body, match('res.body', res.body))
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.buffer, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.ok(typeof res.body === 'string', 'Received string (and not buffer) back')
    assert.strictEqual(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.encodedWithBinaryTypeBad, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
    assert.strictEqual(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.encodedWithBinaryTypeGood, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
    assert.strictEqual(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.secureCookieHeader, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc6.secureCookieHeader.body, res.body, match('res.body', res.body))
    assert.ok(!res.isBase64Encoded, 'isBase64Encoded param not passed through')
    assert.strictEqual(responses.arc6.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.secureCookieMultiValueHeader, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(responses.arc6.secureCookieMultiValueHeader.body, res.body, match('res.body', res.body))
    assert.ok(!res.isBase64Encoded, 'isBase64Encoded param not passed through')
    assert.strictEqual(str(responses.arc6.secureCookieMultiValueHeader.multiValueHeaders), str(res.multiValueHeaders), match(`res.multiValueHeaders`, str(res.multiValueHeaders)))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.multiValueHeaders, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.body, '', 'Empty body passed')
    assert.ok(!res.isBase64Encoded, 'isBase64Encoded param not passed through')
    // Headers object gets mutated, so let's just ensure a header we set is there
    assert.strictEqual(str(responses.arc6.multiValueHeaders.headers['set-cookie']), str(res.headers['set-cookie']), match(`res.headers['set-cookie']`, str(res.headers['set-cookie'])))
    assert.strictEqual(str(responses.arc6.multiValueHeaders.multiValueHeaders), str(res.multiValueHeaders), match(`res.multiValueHeaders`, str(res.multiValueHeaders)))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.invalidMultiValueHeaders, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.body, '', 'Empty body passed')
    assert.ok(!res.isBase64Encoded, 'isBase64Encoded param not passed through')
    // Headers object gets mutated, so let's just ensure a header we set is there
    assert.strictEqual(str(responses.arc6.invalidMultiValueHeaders.invalidMultiValueHeaders), str(res.invalidMultiValueHeaders), match(`res.invalidMultiValueHeaders`, str(res.invalidMultiValueHeaders)))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
})

test('Architect v5 (REST): dependency-free responses', () => {
  let request = requests.arc7.getIndex

  run(legacyResponses.arc5.type, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc5.type.type, res.headers['content-type'], `type matches res.headers['content-type']: ${res.headers['content-type']}`)
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.cookie, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.headers['set-cookie'], legacyResponses.arc5.cookie.cookie, `Cookie set: ${legacyResponses.arc5.cookie.cookie}...`)
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.secureCookie, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.headers['set-cookie'], legacyResponses.arc5.secureCookie.cookie, `Cookie set: ${legacyResponses.arc5.secureCookie.cookie}...`)
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.secureCookieHeader, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc5.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.cors, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.headers['access-control-allow-origin'], '*', `CORS boolean set res.headers['access-control-allow-origin'] === '*'`)
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.isBase64Encoded, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc5.isBase64Encoded.body, res.body, match('res.body', res.body))
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.isBase64EncodedType, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc5.isBase64EncodedType.body, res.body, match('res.body', res.body))
    assert.strictEqual(legacyResponses.arc5.isBase64EncodedType.type, res.headers['content-type'], `type matches res.headers['content-type']: ${res.headers['content-type']}`)
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.isBase64EncodedUnknownCT, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc5.isBase64EncodedUnknownCT.body, res.body, match('res.body', res.body))
    assert.strictEqual(legacyResponses.arc5.isBase64EncodedUnknownCT.headers['content-type'], res.headers['content-type'], match(`res.headers['content-type']`, res.headers['content-type']))
    assert.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
})

test('Architect v5 (REST) + Functions', () => {
  let request = requests.arc7.getIndex

  run(legacyResponses.arc5.body, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(str(legacyResponses.arc5.body.body), str(res.body), match('res.body', res.body))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
    assert.ok(!res.type, 'Responded with res.type set') // This used to be t.ok, but we removed res.type in v4
  })
  run(legacyResponses.arc5.cacheControl, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc5.cacheControl.cacheControl, res.headers['cache-control'], match(`res.headers['cache-control']`, str(res.headers['cache-control'])))
    if (legacyResponses.arc5.cacheControl.headers['cache-control'] && !res.headers['Cache-Control'])
      assert.ok(true, `Headers normalized and de-duped: ${str(res.headers)}`)
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.noCacheControlHTML, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.headers['cache-control'], antiCache, 'Default anti-caching headers set for HTML response')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.noCacheControlJSON, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.headers['cache-control'], antiCache, 'Default anti-caching headers set for JSON response')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.noCacheControlJSONapi, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.headers['cache-control'], antiCache, 'Default anti-caching headers set for JSON response')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.noCacheControlOther, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    let def = 'max-age=86400'
    assert.strictEqual(res.headers['cache-control'], def, 'Default caching headers set for non-HTML/JSON response')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
  run(legacyResponses.arc5.defaultsToJson, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.match(res.headers['content-type'], /application\/json/, 'Unspecified content type defaults to JSON')
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
  })
})

/**
 * Ensure the legacy res.type (Arc v5 VTL) param doesn't get set
 * Conditions were:
 * - `!process.env.ARC_CLOUDFORMATION && (!process.env.ARC_HTTP || process.env.ARC_HTTP === 'aws')`
 * - And also not a proxy request: `!req.resource || req?.resource !== '/{proxy+}'`
 */
test('Architect v5 (REST) + Functions do not send res.type', () => {
  let request = requests.arc6.getIndex
  assert.ok(request.resource, 'Request a Lambda proxy request')

  let run = (response, callback) => {
    let handler = http((req, res) => res(response))
    handler(copy(request), {}, (err, res) => {
      callback(err, res)
    })
  }
  run(legacyResponses.arc5.body, (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(str(legacyResponses.arc5.body.body), str(res.body), match('res.body', res.body))
    assert.strictEqual(res.statusCode, 200, 'Responded with 200')
    assert.ok(!res.type, 'Responded without res.type')
  })
})

test('Architect v4 + Functions statically-bound content type responses (HTTP)', () => {
  let request = requests.arc7.getIndex
  let r = legacyResponses.arc4
  let run = (response, data, contentType) => {
    let handler = http((req, res) => res(response))
    responsesTested.push(response)
    handler(copy(request), {}, (err, res) => {
      assert.ok(!err, 'No error')
      // Don't double-encode JSON
      if (res.headers['content-type'].includes('json')) {
        assert.strictEqual(str(data), res.body, match('res.body', res.body))
      }
      else {
        assert.strictEqual(str(data), str(res.body), match('res.body', res.body))
      }
      assert.match(res.headers['content-type'], new RegExp(contentType), `Correct content-type header sent: ${contentType}`)
      assert.strictEqual(res.statusCode, 200, 'Responded with 200')
    })
  }
  run(r.css, r.css.css, 'text/css')
  run(r.html, r.html.html, 'text/html')
  run(r.js, r.js.js, 'text/javascript')
  run(r.json, r.json.json, 'application/json')
  run(r.text, r.text.text, 'text/plain')
  run(r.xml, r.xml.xml, 'application/xml')
})

test('Architect v4 + Functions statically-bound content type responses (REST)', () => {
  let request = requests.arc6.getIndex
  let r = legacyResponses.arc4
  let run = (response, data, contentType) => {
    let handler = http((req, res) => res(response))
    responsesTested.push(response)
    handler(copy(request), {}, (err, res) => {
      assert.ok(!err, 'No error')
      // Don't double-encode JSON
      if (res.headers['content-type'].includes('json')) {
        assert.strictEqual(str(data), res.body, match('res.body', res.body))
      }
      else {
        assert.strictEqual(str(data), str(res.body), match('res.body', res.body))
      }
      assert.match(res.headers['content-type'], new RegExp(contentType), `Correct content-type header sent: ${contentType}`)
      assert.strictEqual(res.statusCode, 200, 'Responded with 200')
    })
  }
  run(r.css, r.css.css, 'text/css')
  run(r.html, r.html.html, 'text/html')
  run(r.js, r.js.js, 'text/javascript')
  run(r.json, r.json.json, 'application/json')
  run(r.text, r.text.text, 'text/plain')
  run(r.xml, r.xml.xml, 'application/xml')
})

test('Architect <6 + Functions old school response params (HTTP)', () => {
  let request = requests.arc7.getIndex

  run(legacyResponses.arc.location, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.statusCode, 302, match('res.statusCode', res.statusCode))
    assert.strictEqual(legacyResponses.arc.location.location, res.headers.location, match('res.headers.location', res.headers.location))
    assert.strictEqual(res.headers['cache-control'], antiCache, match('cache-control', res.headers['cache-control']))
  })
  run(legacyResponses.arc.status, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc.status.status, res.statusCode, match('code', res.statusCode))
  })
  run(legacyResponses.arc.code, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc.code.code, res.statusCode, match('status', res.statusCode))
  })
  run(legacyResponses.arc.statusCode, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc.statusCode.statusCode, res.statusCode, match('statusCode', res.statusCode))
  })
  run(legacyResponses.arc.session, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.match(res.headers['set-cookie'], /_idx=/, `Cookie set: ${res.headers['set-cookie'].substr(0, 75)}...`)
  })
})

test('Architect <6 + Functions old school response params (REST)', () => {
  let request = requests.arc6.getIndex

  run(legacyResponses.arc.location, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.statusCode, 302, match('res.statusCode', res.statusCode))
    assert.strictEqual(legacyResponses.arc.location.location, res.headers.location, match('res.headers.location', res.headers.location))
    assert.strictEqual(res.headers['cache-control'], antiCache, match('cache-control', res.headers['cache-control']))
  })
  run(legacyResponses.arc.status, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc.status.status, res.statusCode, match('code', res.statusCode))
  })
  run(legacyResponses.arc.code, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc.code.code, res.statusCode, match('status', res.statusCode))
  })
  run(legacyResponses.arc.statusCode, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(legacyResponses.arc.statusCode.statusCode, res.statusCode, match('statusCode', res.statusCode))
  })
  run(legacyResponses.arc.session, copy(request), (err, res) => {
    assert.ok(!err, 'No error')
    assert.match(res.headers['set-cookie'], /_idx=/, `Cookie set: ${res.headers['set-cookie'].substr(0, 75)}...`)
  })
})

test('Return an error (HTTP)', () => {
  let request = requests.arc7.getIndex
  let error = Error('something bad happened')
  let handler = http((req, res) => res(error))
  handler(copy(request), {}, (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.statusCode, 500, 'Error response, 500 returned')
    assert.match(res.body, new RegExp(error.message), `Error response included error message: ${error.message}`)
  })
})

test('Return an error (REST)', () => {
  let request = requests.arc6.getIndex
  let error = Error('something bad happened')
  let handler = http((req, res) => res(error))
  handler(copy(request), {}, (err, res) => {
    assert.ok(!err, 'No error')
    assert.strictEqual(res.statusCode, 500, 'Error response, 500 returned')
    assert.match(res.body, new RegExp(error.message), `Error response included error message: ${error.message}`)
  })
})

test('Verify all Arc v7 (HTTP) + Arc v6 (REST) + legacy response fixtures were tested', () => {
  let tester = ([ name, req ]) => {
    assert.ok(responsesTested.some(tested => {
      try {
        deepStrictEqual(req, tested)
        return true
      }
      catch { /* noop */ }
    }), `Tested res: ${name}`)
  }
  console.log(`Arc 7 responses`)
  Object.entries(responses.arc7).forEach(tester)
  console.log(`Arc 6 responses`)
  Object.entries(responses.arc6).forEach(tester)
  console.log(`Legacy Arc 5 responses`)
  Object.entries(legacyResponses.arc5).forEach(tester)
  console.log(`Legacy Arc 4 responses`)
  Object.entries(legacyResponses.arc4).forEach(tester)
  console.log(`Legacy Arc responses`)
  Object.entries(legacyResponses.arc).forEach(tester)
})

test('Teardown', () => {
  delete process.env.ARC_ENV
  delete process.env.ARC_SESSION_TABLE_NAME
  assert.ok(true, 'Done')
})
