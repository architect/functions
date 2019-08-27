let arc = require('../../../../../src/')
let bodyParser = require('../../../../../src/http/helpers/body-parser')
let interpolate = require('../../../../../src/http/helpers/params')
let test = require('tape')
let reqs = require('../http-req-fixtures')

let str = i => JSON.stringify(i)
let isObject = t => typeof t === 'object' && !!(t)
let unNulled = (before, after) => before === null && isObject(after)
let b64dec = i => new Buffer.from(i, 'base64').toString()
let match = (copy, item) => `${copy} matches: ${item}`
let basicResponse = {statusCode: 200}

test('Set up env', t => {
  t.plan(3)
  t.ok(arc.http.async, 'Loaded HTTP async')
  t.ok(arc.http.middleware, 'Loaded HTTP middleware alias')
  t.ok(reqs, 'Loaded request fixtures')
})

/**
 * Arc 6 tests for compatibility with Lambda proxy integration signature changes, such as:
 * - `nulls` passed instead of empty objects
 * - All bodies are base64 encoded
 */
test('Architect v6: get /', async t => {
  // Set env var to keep from stalling on db reads in CI
  process.env.SESSION_TABLE_NAME = 'jwe'
  t.plan(7)
  let request = reqs.arc6.getIndex
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    // Compare mutation of nulls into objects
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
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
})

test('Architect v6: get /?whats=up', async t => {
  t.plan(7)
  let request = reqs.arc6.getWithQueryString
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (request.queryStringParameters === req.query)
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v6: get /nature/hiking', async t => {
  t.plan(8)
  let request = reqs.arc6.getWithParam
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    if (unNulled(request.body, req.body))
      t.pass(match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
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
})

test('Architect v6: post /form (JSON)', async t => {
  t.plan(8)
  let request = reqs.arc6.postJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v6: post /form (form URL encoded)', async t => {
  t.plan(8)
  let request = reqs.arc6.postFormURL
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', str(req.body))) // For some reason this body needs to be stringified to not error on print
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v6: post /form (multipart form data)', async t => {
  t.plan(8)
  let request = reqs.arc6.postMultiPartFormData
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(b64dec(req.body.base64), 'hi there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v6: post /form (octet stream)', async t => {
  t.plan(8)
  let request = reqs.arc6.postOctetStream
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(b64dec(req.body.base64), 'hi there\n', `received expected body data`)
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v6: put /form (JSON)', async t => {
  t.plan(8)
  let request = reqs.arc6.putJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v6: patch /form (JSON)', async t => {
  t.plan(8)
  let request = reqs.arc6.patchJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v6: delete /form (JSON)', async t => {
  t.plan(8)
  let request = reqs.arc6.deleteJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(bodyParser(request)), str(req.body), match('req.body', req.body))
    t.equal(req.body.hi, 'there', `received expected body data`)
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    if (unNulled(request.pathParameters, req.params))
      t.equal(req.pathParameters, req.params, match('req.params/pathParameters', req.params))
    if (unNulled(request.queryStringParameters, req.query))
      t.equal(req.queryStringParameters, req.query, match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

/**
 * Arc 5 tests against later VTL-based request shapes, which include things not present in < Arc 5, such as:
 * - `httpMethod` & `queryStringParameters` (which duplicate `method` + `query`)
 * - `body: {base64: 'base64encodedstring...'}`
 * Backwards compatibility should not be determined solely by the presense of these additional params
 */
test('Architect v5: get /', async t => {
  t.plan(7)
  let request = reqs.arc5.getIndex
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v5: get /?whats=up', async t => {
  t.plan(7)
  let request = reqs.arc5.getWithQueryString
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v5: get /nature/hiking', async t => {
  t.plan(7)
  let request = reqs.arc5.getWithParam
  interpolate(request)
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, `req.path interpolated, matches: "${req.path}"`)
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v5: post /form (JSON / form URL-encoded)', async t => {
  t.plan(7)
  let request = reqs.arc5.post
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v5: post /form (multipart form data-encoded)', async t => {
  t.plan(7)
  let request = reqs.arc5.postBinary
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v5: put /form', async t => {
  t.plan(7)
  let request = reqs.arc5.put
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v5: patch /form', async t => {
  t.plan(7)
  let request = reqs.arc5.patch
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('Architect v5: delete /form', async t => {
  t.plan(7)
  let request = reqs.arc5.delete
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
    t.equal(str(request.body), str(req.body), match('req.body', req.body))
    t.equal(request.path, req.path, match('req.path',req.path))
    t.equal(str(request.headers), str(req.headers), match('req.headers', req.headers))
    if (request.httpMethod === req.method)
      t.equal(req.httpMethod, req.method, match('req.method/httpMethod', req.method))
    t.equal(str(request.params), str(req.params), match('req.params', req.params))
    if (str(request.query) === str(req.query))
      t.equal(str(req.queryStringParameters), str(req.query), match('req.query/queryStringParameters', req.query))
    t.ok(req.session, 'req.session is present')
})

test('arc.middleware should allow the mutation of request object between middleware functions', t => {
  t.plan(1)
  let request = reqs.arc5.getIndex
  let req = JSON.parse(str(request))
  let one = function (req) {
    req.body = req.body || {}
    req.body.munge = true
    return req
  }
  let two = function (req) {
    t.ok(req.body.munge, 'request object was mutated in middleware')
    return { statusCode: 200, body: req.body }
  }
  let handler = arc.http.async(one, two)
  handler(req)
})

test('arc.middleware should pass along original request if function does not return', async t => {
  t.plan(1)
  let request = reqs.arc5.getIndex
  let gotOne
  let one = async req => {
    gotOne = req
    return
  }
  let gotTwo
  let two = async req => {
    gotTwo = req
    return {statusCode: 200}
  }
  let req = JSON.parse(str(request))
  let handler = arc.http.async(one, two)
  await handler(req)
  t.equal(str(gotOne), str(gotTwo), match('second function request', `${str(gotTwo).substr(0,50)}...`))
  // Unset env var for future testing (ostensibly)
  delete process.env.SESSION_TABLE_NAME
})
