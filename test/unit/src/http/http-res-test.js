let http = require('../../../../src').http
let test = require('tape')
let requests = require('./http-req-fixtures')
let responses = require('./http-res-fixtures')

let b64dec = i => new Buffer.from(i, 'base64').toString()
let str = i => JSON.stringify(i)
let match = (copy, item) => `${copy} matches: ${item}`

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

let run = (response, request, callback) => {
  let handler = http((req, res) => res(response))
  handler(request, {}, callback)
}

test('Set up env', t => {
  t.plan(2)
  t.ok(http, 'Loaded HTTP')
  t.ok(responses, 'Loaded response fixtures')
  // Init env var to keep from stalling on db reads in CI
  process.env.SESSION_TABLE_NAME = 'jwe'
})

test('Architect v6 (HTTP)', t => {
  t.plan(63)
  let request = requests.arc6.http.getIndex
  arc6EnvVars.setup(t)
  run(responses.arc6.http.noReturn, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.body, '', 'Empty body passed')
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.emptyReturn, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.body, '', 'Empty body passed')
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.string, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc6.http.string), res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.object, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc6.http.object), res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.array, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc6.http.array), res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.buffer, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc6.http.buffer), res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.number, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc6.http.number), res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.bodyOnly, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.http.bodyOnly.body, res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.bodyWithStatus, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.http.bodyWithStatus.body, res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.bodyWithStatusAndContentType, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.http.bodyWithStatusAndContentType.body, res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.encodedWithBinaryType, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.http.encodedWithBinaryType.body, res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/pdf'), 'Unspecified content type defaults to JSON')
    t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.cookies, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.http.cookies.body, res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(str(responses.arc6.http.cookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.secureCookies, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.http.secureCookies.body, res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(str(responses.arc6.http.secureCookies.cookies), str(res.cookies), match('res.cookies', res.cookies))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.secureCookieHeader, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.http.secureCookieHeader.body, res.body, match('res.body', res.body))
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(responses.arc6.rest.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.http.invalid, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.body, '', 'Empty body passed')
    t.equal(responses.arc6.http.invalid.statusCode, res.statusCode, 'Responded with invalid status code')
  })
})

test('Architect v6 (REST): dependency-free responses', t => {
  t.plan(44)
  let request = requests.arc6.rest.getIndex
  arc6EnvVars.setup(t)

  run(responses.arc6.rest.body, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.rest.body.body, res.body, match('res.body', res.body))
    t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.isBase64Encoded, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.rest.isBase64Encoded.body, res.body, match('res.body', res.body))
    t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.buffer, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(typeof res.body === 'string', 'Received string (and not buffer) back')
    t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
    t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.encodedWithBinaryTypeBad, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
    t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
    t.ok(res.isBase64Encoded, 'isBase64Encoded param set automatically')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.encodedWithBinaryTypeGood, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(typeof res.body === 'string', 'Body is (likely) base 64 encoded')
    t.equal(b64dec(res.body), 'hi there\n', 'Body properly auto-encoded')
    t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.secureCookieHeader, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.rest.secureCookieHeader.body, res.body, match('res.body', res.body))
    t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
    t.equal(responses.arc6.rest.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.secureCookieMultiValueHeader, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc6.rest.secureCookieMultiValueHeader.body, res.body, match('res.body', res.body))
    t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
    t.equal(str(responses.arc6.rest.secureCookieMultiValueHeader.multiValueHeaders), str(res.multiValueHeaders), match(`res.multiValueHeaders`, str(res.multiValueHeaders)))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.multiValueHeaders, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.body, '', 'Empty body passed')
    t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
    // Headers object gets mutated, so let's just ensure a header we set is there
    t.equal(str(responses.arc6.rest.multiValueHeaders.headers['Set-Cookie']), str(res.headers['Set-Cookie']), match(`res.headers['Set-Cookie']`, str(res.headers['Set-Cookie'])))
    t.equal(str(responses.arc6.rest.multiValueHeaders.multiValueHeaders), str(res.multiValueHeaders), match(`res.multiValueHeaders`, str(res.multiValueHeaders)))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc6.rest.invalidMultiValueHeaders, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.body, '', 'Empty body passed')
    t.notOk(res.isBase64Encoded, 'isBase64Encoded param not passed through')
    // Headers object gets mutated, so let's just ensure a header we set is there
    t.equal(str(responses.arc6.rest.invalidMultiValueHeaders.invalidMultiValueHeaders), str(res.invalidMultiValueHeaders), match(`res.invalidMultiValueHeaders`, str(res.invalidMultiValueHeaders)))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  arc6EnvVars.teardown(t)
})

test('Architect v5 (REST): dependency-free responses', t => {
  t.plan(29)
  let request = requests.arc5.getIndex

  run(responses.arc5.type, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc5.type.type, res.headers['Content-Type'], `type matches res.headers['Content-Type']: ${res.headers['Content-Type']}`)
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.cookie, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(res.headers['Set-Cookie'].includes('_idx='), `Cookie set: ${res.headers['Set-Cookie'].substr(0, 75)}...`)
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.secureCookie, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(res.headers['Set-Cookie'].includes('_idx='), `Cookie set: ${res.headers['Set-Cookie'].substr(0, 75)}...`)
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.secureCookieHeader, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc5.secureCookieHeader.headers['set-cookie'], res.headers['set-cookie'], match(`res.headers['set-cookie']`, res.headers['set-cookie']))
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.cors, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.headers['Access-Control-Allow-Origin'], '*', `CORS boolean set res.headers['Access-Control-Allow-Origin'] === '*'`)
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.isBase64Encoded, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc5.isBase64Encoded.body, res.body, match('res.body', res.body))
    t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.isBase64EncodedType, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc5.isBase64EncodedType.body, res.body, match('res.body', res.body))
    t.equal(responses.arc5.isBase64EncodedType.type, res.headers['Content-Type'], `type matches res.headers['Content-Type']: ${res.headers['Content-Type']}`)
    t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.isBase64EncodedUnknownCT, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc5.isBase64EncodedUnknownCT.body, res.body, match('res.body', res.body))
    t.equal(responses.arc5.isBase64EncodedUnknownCT.headers['content-type'], res.headers['Content-Type'], match(`res.headers['content-type']`, res.headers['Content-Type']))
    t.ok(res.isBase64Encoded, 'isBase64Encoded param passed through')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
})

test('Architect v5 (REST) + Functions', t => {
  t.plan(23)
  let request = requests.arc5.getIndex
  let antiCache = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'

  run(responses.arc5.body, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
    t.equal(res.statusCode, 200, 'Responded with 200')
    t.ok(res.type, 'Responded with res.type set')
  })
  run(responses.arc5.cacheControl, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc5.cacheControl.cacheControl, res.headers['Cache-Control'], match(`res.headers['Cache-Control']`, str(res.headers['Cache-Control'])))
    if (responses.arc5.cacheControl.headers['cache-control'] && !res.headers['cache-control'])
      t.pass(`Headers normalized and de-duped: ${str(res.headers)}`)
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.noCacheControlHTML, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for HTML response')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.noCacheControlJSON, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for JSON response')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.noCacheControlJSONapi, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.headers['Cache-Control'], antiCache, 'Default anti-caching headers set for JSON response')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.noCacheControlOther, request, (err, res) => {
    t.notOk(err, 'No error')
    let def = 'max-age=86400'
    t.equal(res.headers['Cache-Control'], def, 'Default caching headers set for non-HTML/JSON response')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
  run(responses.arc5.defaultsToJson, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(res.headers['Content-Type'].includes('application/json'), 'Unspecified content type defaults to JSON')
    t.equal(res.statusCode, 200, 'Responded with 200')
  })
})

/**
 * Proxy + ARC_HTTP + ARC_CLOUDFORMATION response logic
 * - broken into individual test blocks because tape gets aggro in setting/unsetting env vars
 */
test('Architect v6 (REST) + Functions + /{proxy+}', t => {
  t.plan(4)
  arc6EnvVars.setup(t)
  let request = requests.arc6.rest.getProxyPlus

  run(responses.arc6.rest.body, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
    t.equal(res.statusCode, 200, 'Responded with 200')
    t.notOk(res.type, 'Responded without res.type set')
  })
  arc6EnvVars.teardown(t)
})

test('Architect v5 (REST) + Functions + ARC_HTTP = aws', t => {
  t.plan(5)
  let request = requests.arc5.getIndex
  process.env.ARC_HTTP = 'aws'
  let run = (response, callback) => {
    let handler = http((req, res) => res(response))
    handler(request, {}, (err, res) => {
      t.equal(process.env.ARC_HTTP, 'aws', 'Set: ARC_HTTP = aws')
      callback(err, res)
    })
  }
  run(responses.arc5.body, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
    t.equal(res.statusCode, 200, 'Responded with 200')
    t.ok(res.type, 'Responded with res.type set with ARC_HTTP = aws')
  })
})

test('Architect v5 (REST) + Functions + ARC_HTTP = aws_proxy', t => {
  t.plan(5)
  let request = requests.arc5.getIndex
  process.env.ARC_HTTP = 'aws_proxy'
  let run = (response, callback) => {
    let handler = http((req, res) => res(response))
    handler(request, {}, (err, res) => {
      t.equal(process.env.ARC_HTTP, 'aws_proxy', 'Set: ARC_HTTP = aws_proxy')
      callback(err, res)
    })
  }
  run(responses.arc5.body, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
    t.equal(res.statusCode, 200, 'Responded with 200')
    t.notOk(res.type, 'Responded without res.type set with ARC_HTTP = aws_proxy')
  })
})

test('Architect v5 (REST) + Functions + ARC_HTTP = other', t => {
  t.plan(5)
  let request = requests.arc5.getIndex
  process.env.ARC_HTTP = 'other' // tests !aws && !aws_proxy ARC_HTTP values (jic)
  let run = (response, callback) => {
    let handler = http((req, res) => res(response))
    handler(request, {}, (err, res) => {
      t.equal(process.env.ARC_HTTP, 'other', 'Set: ARC_HTTP = other')
      callback(err, res)
    })
  }
  run(responses.arc5.body, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
    t.equal(res.statusCode, 200, 'Responded with 200')
    t.notOk(res.type, 'Responded without res.type set with ARC_HTTP = other')
  })
})

test('Architect v5 (REST) + Functions + !ARC_HTTP + !ARC_CLOUDFORMATION', t => {
  t.plan(6)
  let request = requests.arc5.getIndex
  delete process.env.ARC_HTTP
  let run = (response, callback) => {
    let handler = http((req, res) => res(response))
    handler(request, {}, (err, res) => {
      t.notOk(process.env.ARC_HTTP, 'ARC_HTTP not set')
      t.notOk(process.env.ARC_CLOUDFORMATION, 'ARC_CLOUDFORMATION not set')
      callback(err, res)
    })
  }
  run(responses.arc5.body, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
    t.equal(res.statusCode, 200, 'Responded with 200')
    t.ok(res.type, 'Responded with res.type set (default behavior)')
  })
})

test('Architect v5 (REST) + Functions + ARC_CLOUDFORMATION = true', t => {
  t.plan(6)
  let request = requests.arc5.getIndex
  process.env.ARC_CLOUDFORMATION = true
  let run = (response, callback) => {
    let handler = http((req, res) => res(response))
    handler(request, {}, (err, res) => {
      t.ok(process.env.ARC_CLOUDFORMATION, 'Set: ARC_CLOUDFORMATION = true')
      callback(err, res)
    })
  }
  run(responses.arc5.body, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(str(responses.arc5.body.body), str(res.body), match('res.body', res.body))
    t.equal(res.statusCode, 200, 'Responded with 200')
    t.notOk(res.type, 'Responded without res.type set with ARC_CLOUDFORMATION = true')
    delete process.env.ARC_CLOUDFORMATION
    t.notOk(process.env.ARC_CLOUDFORMATION, 'Unset: ARC_CLOUDFORMATION = true')
  })
})

test('Architect v4-style + Functions statically-bound content type responses (REST)', t => {
  t.plan(24)
  let request = requests.arc5.getIndex
  let r = responses.arc4
  let run = (response, data, contentType) => {
    let handler = http((req, res) => res(response))
    handler(request, {}, (err, res) => {
      t.notOk(err, 'No error')
      // Don't double-encode JSON
      if (res.headers['Content-Type'].includes('json'))
        t.equal(str(data), res.body, match('res.body', res.body))
      else
        t.equal(str(data), str(res.body), match('res.body', res.body))
      t.true(res.headers['Content-Type'].includes(contentType), `Correct Content-Type header sent: ${contentType}`)
      t.equal(res.statusCode, 200, 'Responded with 200')
    })
  }
  run(r.css, r.css.css, 'text/css')
  run(r.html, r.html.html, 'text/html')
  run(r.js, r.js.js, 'text/javascript')
  run(r.json, r.json.json, 'application/json')
  run(r.text, r.text.text, 'text/plain')
  run(r.xml, r.xml.xml, 'application/xml')
})

test('Architect v4-style + Functions statically-bound content type responses (HTTP)', t => {
  t.plan(24)
  let request = requests.arc6.http.getIndex
  let r = responses.arc4
  let run = (response, data, contentType) => {
    let handler = http((req, res) => res(response))
    handler(request, {}, (err, res) => {
      t.notOk(err, 'No error')
      // Don't double-encode JSON
      if (res.headers['Content-Type'].includes('json'))
        t.equal(str(data), res.body, match('res.body', res.body))
      else
        t.equal(str(data), str(res.body), match('res.body', res.body))
      t.true(res.headers['Content-Type'].includes(contentType), `Correct Content-Type header sent: ${contentType}`)
      t.equal(res.statusCode, 200, 'Responded with 200')
    })
  }
  run(r.css, r.css.css, 'text/css')
  run(r.html, r.html.html, 'text/html')
  run(r.js, r.js.js, 'text/javascript')
  run(r.json, r.json.json, 'application/json')
  run(r.text, r.text.text, 'text/plain')
  run(r.xml, r.xml.xml, 'application/xml')
})

test('Architect <6 + Functions old school response params (HTTP)', t => {
  t.plan(11)
  let request = requests.arc6.http.getIndex

  run(responses.arc.location, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.statusCode, 302, match('res.statusCode', res.statusCode))
    t.equal(responses.arc.location.location, res.headers.Location, match('res.headers.Location', res.headers.Location))
  })
  run(responses.arc.status, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc.status.status, res.statusCode, match('code', res.statusCode))
  })
  run(responses.arc.code, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc.code.code, res.statusCode, match('status', res.statusCode))
  })
  run(responses.arc.statusCode, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc.statusCode.statusCode, res.statusCode, match('statusCode', res.statusCode))
  })
  run(responses.arc.session, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(res.headers['Set-Cookie'].includes('_idx='), `Cookie set: ${res.headers['Set-Cookie'].substr(0, 75)}...`)
  })
})

test('Architect <6 + Functions old school response params (REST)', t => {
  t.plan(11)
  let request = requests.arc5.getIndex

  run(responses.arc.location, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.statusCode, 302, match('res.statusCode', res.statusCode))
    t.equal(responses.arc.location.location, res.headers.Location, match('res.headers.Location', res.headers.Location))
  })
  run(responses.arc.status, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc.status.status, res.statusCode, match('code', res.statusCode))
  })
  run(responses.arc.code, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc.code.code, res.statusCode, match('status', res.statusCode))
  })
  run(responses.arc.statusCode, request, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(responses.arc.statusCode.statusCode, res.statusCode, match('statusCode', res.statusCode))
  })
  run(responses.arc.session, request, (err, res) => {
    t.notOk(err, 'No error')
    t.ok(res.headers['Set-Cookie'].includes('_idx='), `Cookie set: ${res.headers['Set-Cookie'].substr(0, 75)}...`)
  })
})

test('Test errors', t => {
  t.plan(3)
  let request = requests.arc5.getIndex
  let error = Error('something bad happened')
  let handler = http((req, res) => res(error))
  handler(request, {}, (err, res) => {
    t.notOk(err, 'No error')
    t.equal(res.statusCode, 500, 'Error response, 500 returned')
    t.ok(res.body.includes(error.message), `Error response included error message: ${error.message}`)
  })
})

test('Teardown', t => {
  t.plan(1)
  // Unset env var for future testing (ostensibly)
  delete process.env.SESSION_TABLE_NAME
  t.pass('Done')
})
