let http = require('../../../../src').http
let interpolate = require('../../../../src/http/helpers/params')
let test = require('tape')
let reqs = require('./http-req-fixtures')

let str = i => JSON.stringify(i)
let isObject = t => typeof t === 'object' && !!(t)
let unNulled = (before, after) => before === null && isObject(after)
let match = (copy, item) => `${copy} matches: ${str(item)}`
let basicResponse = { statusCode: 200 }

let arc6RestNull = [ 'body', 'pathParameters', 'queryStringParameters', 'multiValueQueryStringParameters' ]
let isNulled = key => arc6RestNull.some(v => v === key)

let arc6RestPrettyParams = {
  method: 'httpMethod',
  params: 'pathParameters',
  query: 'queryStringParameters'
}

function check ({ req, request, res, t, deprecated = false }) {
  // Make sure all original keys are present and accounted for
  Object.keys(request).forEach(key => {
    // eslint-disable-next-line
    if (!req.hasOwnProperty(key)) t.fail(`Original request param missing from interpolated request: ${key}`)
  })
  Object.entries(req).forEach(([ key, val ]) => {
    // Make sure we don't have any false positives matching undefined tests
    if (req[key] === undefined) t.fail(`Parameter is undefined: ${key}`)
    // Compare mutation of nulls into objects
    if (isNulled(key) && request[key] === null) {
      if (unNulled(request[key], val))
        t.pass(match(`req.${key}`, req[key]))
      else
        t.fail(`Param not un-nulled: ${key}: ${val}`)
    }
    else {
      t.equal(str(val), str(req[key]), match(`req.${key}`, str(req[key])))
    }
    // Compare interpolation to nicer, backwards compat req params
    if (arc6RestPrettyParams[key] && !deprecated) {
      t.equal(str(req[arc6RestPrettyParams[key]]), str(req[key]), `req.${key} == req.${arc6RestPrettyParams[key]}`)
    }
  })
  t.ok(req.session, 'req.session is present')
  res(basicResponse)
}

test('Set up env', t => {
  t.plan(2)
  t.ok(http, 'Loaded HTTP')
  t.ok(reqs, 'Loaded request fixtures')
  // Set env var to keep from stalling on db reads in CI
  process.env.SESSION_TABLE_NAME = 'jwe'
})

test('Architect v6 (HTTP): get /', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.getIndex
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): get /?whats=up', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.getWithQueryString
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): get /?whats=up&whats=there', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.getWithQueryStringDuplicateKey
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): get /nature/hiking', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.getWithParam
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): get /$default', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.get$default
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): post /form (JSON)', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.postJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): post /form (form URL encoded)', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.postFormURL
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): post /form (octet stream)', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.postOctetStream
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): put /form (JSON)', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.putJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): patch /form (JSON)', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.patchJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (HTTP): delete /form (JSON)', t => {
  t.plan(22)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.http.deleteJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

/**
 * Arc 6 REST tests for compatibility with Lambda proxy integration signature changes, such as:
 * - `nulls` passed instead of empty objects
 * - All bodies are base64 encoded
 */
test('Architect v6 (REST): get /', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.getIndex
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): get /?whats=up', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.getWithQueryString
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): get /?whats=up&whats=there', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.getWithQueryStringDuplicateKey
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): get /nature/hiking', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.getWithParam
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): get /{proxy+}', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.getProxyPlus
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): post /form (JSON)', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.postJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): post /form (form URL encoded)', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.postFormURL
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): post /form (multipart form data)', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.postMultiPartFormData
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): post /form (octet stream)', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.postOctetStream
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): put /form (JSON)', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.putJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): patch /form (JSON)', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.patchJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

test('Architect v6 (REST): delete /form (JSON)', t => {
  t.plan(19)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc6.rest.deleteJson
  let handler = http((req, res) => {
    check({ req, request, res, t })
  })
  handler(request, {}, end)
})

/**
 * Arc 5 tests against later VTL-based request shapes, which include things not present in < Arc 5, such as:
 * - `httpMethod` & `queryStringParameters` (which duplicate `method` + `query`)
 * - `body: {base64: 'base64encodedstring...'}`
 * Backwards compatibility should not be determined solely by the presense of these additional params
 */
test('Architect v5 (REST): get /', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.getIndex
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Architect v5 (REST): get /?whats=up', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.getWithQueryString
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Architect v5 (REST): get /nature/hiking', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.getWithParam
  interpolate(request)
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Architect v5 (REST): post /form (JSON / form URL-encoded)', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.post
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Architect v5 (REST): post /form (multipart form data-encoded)', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.postBinary
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Architect v5 (REST): put /form', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.put
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Architect v5 (REST): patch /form', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.patch
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Architect v5 (REST): delete /form', t => {
  t.plan(11)
  let end = () => t.pass('Final callback called')
  let request = reqs.arc5.delete
  let handler = http((req, res) => {
    check({ req, request, res, t, deprecated: true })
  })
  handler(request, {}, end)
})

test('Teardown', t => {
  t.plan(1)
  // Unset env var for future testing (ostensibly)
  delete process.env.SESSION_TABLE_NAME
  t.pass('Done')
})
