let http = require('../../../../src').http
let bodyParser = require('../../../../src/http/helpers/body-parser')
let interpolate = require('../../../../src/http/helpers/params')
let test = require('tape')
let reqs = require('./http-req-fixtures')

let str = i => JSON.stringify(i)
let isObject = t => typeof t === 'object' && !!(t)
let unNulled = (before, after) => before === null && isObject(after)
let b64dec = i => new Buffer.from(i, 'base64').toString()
let match = (copy, item) => `${copy} matches: ${str(item)}`
let basicResponse = { statusCode: 200 }

test('Set up env', t => {
  t.plan(2)
  t.ok(http, 'Loaded HTTP')
  t.ok(reqs, 'Loaded request fixtures')
  // Set env var to keep from stalling on db reads in CI
  process.env.SESSION_TABLE_NAME = 'jwe'
})

/**
 * Arc 6 tests for compatibility with Lambda proxy integration signature changes, such as:
 * - `nulls` passed instead of empty objects
 * - All bodies are base64 encoded
 */
test('Architect v6: get /', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.getIndex
  let handler = http((req, res) => {
    // Compare mutation of nulls into objects
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    // Compare interpolation to nicer, backwards compat req params
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    // Compare mutation of nulls into objects, and
    // also compare interpolation to nicer, backwards compat req params
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: get /?whats=up', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.getWithQueryString
  let handler = http((req, res) => {
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (request.queryStringParameters === req.query)
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: get /?whats=up&whats=there', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.getWithQueryStringDuplicateKey
  let handler = http((req, res) => {
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (request.queryStringParameters === req.query)
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.equal(str(request.multiValueQueryStringParameters), str(req.multiValueQueryStringParameters), match('req.multiValueQueryStringParameters', req.multiValueQueryStringParameters))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: get /nature/hiking', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.getWithParam
  let handler = http((req, res) => {
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    // Test resource, which is interpolated differently than 'path' in requests with URL params
    t.equal(request.resource, req.resource, match('req.resource', req.resource))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (str(request.pathParameters) === str(req.pathParameters))
      t.equal(str(req.params), str(req.pathParameters), match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: get /{proxy+}', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.getProxyPlus
  let handler = http((req, res) => {
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(request.resource, req.resource, match('req.resource', req.resource))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (str(request.pathParameters) === str(req.pathParameters))
      t.equal(str(req.params), str(req.pathParameters), match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: post /form (JSON)', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.postJson
  let handler = http((req, res) => {
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: post /form (form URL encoded)', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.postFormURL
  let handler = http((req, res) => {
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: post /form (multipart form data)', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.postMultiPartFormData
  let handler = http((req, res) => {
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(b64dec(req.body.base64), 'hi there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: post /form (octet stream)', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.postOctetStream
  let handler = http((req, res) => {
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(b64dec(req.body.base64), 'hi there\n', `received expected body data`)
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: put /form (JSON)', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.putJson
  let handler = http((req, res) => {
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: patch /form (JSON)', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.patchJson
  let handler = http((req, res) => {
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v6: delete /form (JSON)', t => {
  t.plan(9)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc6.rest.deleteJson
  let handler = http((req, res) => {
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

/**
 * Arc 5 tests against later VTL-based request shapes, which include things not present in < Arc 5, such as:
 * - `httpMethod` & `queryStringParameters` (which duplicate `method` + `query`)
 * - `body: {base64: 'base64encodedstring...'}`
 * Backwards compatibility should not be determined solely by the presense of these additional params
 */
test('Architect v5: get /', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.getIndex
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v5: get /?whats=up', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.getWithQueryString
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v5: get /nature/hiking', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.getWithParam
  interpolate(request)
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, `req.path interpolated, matches: "${req.path}"`)
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v5: post /form (JSON / form URL-encoded)', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.post
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v5: post /form (multipart form data-encoded)', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.postBinary
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v5: put /form', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.put
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v5: patch /form', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.patch
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Architect v5: delete /form', t => {
  t.plan(8)
  let end = () => t.ok(true, 'Final callback called')
  let request = reqs.arc5.delete
  let handler = http((req, res) => {
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path', req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
    res(basicResponse)
  })
  handler(request, {}, end)
})

test('Teardown', t => {
  t.plan(1)
  // Unset env var for future testing (ostensibly)
  delete process.env.SESSION_TABLE_NAME
  t.pass('Done')
})
