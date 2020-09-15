/* eslint require-await: 0 */
let arc = require('../../../../../src/')
let interpolate = require('../../../../../src/http/helpers/params')
let test = require('tape')
let reqs = require('../http-req-fixtures')

let str = i => JSON.stringify(i)
let isObject = t => typeof t === 'object' && !!(t)
let unNulled = (before, after) => before === null && isObject(after)
let match = (copy, item) => `${copy} matches: ${item}`
let basicResponse = { statusCode: 200 }

let arc6RestNull = [ 'body', 'pathParameters', 'queryStringParameters', 'multiValueQueryStringParameters' ]
let isNulled = key => arc6RestNull.some(v => v === key)

let arc6RestPrettyParams = {
  method: 'httpMethod',
  params: 'pathParameters',
  query: 'queryStringParameters'
}

function check ({ req, request, t, deprecated = false }) {
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
}

test('Set up env', t => {
  t.plan(3)
  t.ok(arc.http.async, 'Loaded HTTP async')
  t.ok(arc.http.middleware, 'Loaded HTTP middleware alias')
  t.ok(reqs, 'Loaded request fixtures')
  // Set env var to keep from stalling on db reads in CI
  process.env.SESSION_TABLE_NAME = 'jwe'
})

test('Architect v6 (HTTP): get /', async t => {
  t.plan(21)
  let request = reqs.arc6.http.getIndex
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): get /?whats=up', async t => {
  t.plan(21)
  let request = reqs.arc6.http.getWithQueryString
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): get /?whats=up&whats=there', async t => {
  t.plan(21)
  let request = reqs.arc6.http.getWithQueryStringDuplicateKey
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): get /nature/hiking', async t => {
  t.plan(21)
  let request = reqs.arc6.http.getWithParam
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): get /$default', async t => {
  t.plan(21)
  let request = reqs.arc6.http.get$default
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): post /form (JSON)', async t => {
  t.plan(21)
  let request = reqs.arc6.http.postJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): post /form (form URL encoded)', async t => {
  t.plan(21)
  let request = reqs.arc6.http.postFormURL
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): post /form (multipart form data)', async t => {
  t.plan(21)
  let request = reqs.arc6.http.postMultiPartFormData
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): post /form (octet stream)', async t => {
  t.plan(21)
  let request = reqs.arc6.http.postOctetStream
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): put /form (JSON)', async t => {
  t.plan(21)
  let request = reqs.arc6.http.putJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (HTTP): patch /form (JSON)', async t => {
  t.plan(21)
  let request = reqs.arc6.http.patchJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

/**
 * Arc 6 REST tests for compatibility with Lambda proxy integration signature changes, such as:
 * - `nulls` passed instead of empty objects
 * - All bodies are base64 encoded
 */
test('Architect v6 (REST): get /', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.getIndex
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): get /?whats=up', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.getWithQueryString
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): get /?whats=up&whats=there', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.getWithQueryStringDuplicateKey
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): get /nature/hiking', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.getWithParam
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): get /{proxy+}', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.getProxyPlus
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): post /form (JSON)', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.postJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): post /form (form URL encoded)', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.postFormURL
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): post /form (multipart form data)', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.postMultiPartFormData
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): post /form (octet stream)', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.postOctetStream
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): put /form (JSON)', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.putJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): patch /form (JSON)', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.patchJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

test('Architect v6 (REST): delete /form (JSON)', async t => {
  t.plan(18)
  let request = reqs.arc6.rest.deleteJson
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t })
})

/**
 * Arc 5 tests against later VTL-based request shapes, which include things not present in < Arc 5, such as:
 * - `httpMethod` & `queryStringParameters` (which duplicate `method` + `query`)
 * - `body: {base64: 'base64encodedstring...'}`
 * Backwards compatibility should not be determined solely by the presense of these additional params
 */
test('Architect v5 (REST): get /', async t => {
  t.plan(10)
  let request = reqs.arc5.getIndex
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('Architect v5 (REST): get /?whats=up', async t => {
  t.plan(10)
  let request = reqs.arc5.getWithQueryString
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('Architect v5 (REST): get /nature/hiking', async t => {
  t.plan(10)
  let request = reqs.arc5.getWithParam
  interpolate(request)
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('Architect v5 (REST): post /form (JSON / form URL-encoded)', async t => {
  t.plan(10)
  let request = reqs.arc5.post
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('Architect v5 (REST): post /form (multipart form data-encoded)', async t => {
  t.plan(10)
  let request = reqs.arc5.postBinary
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('Architect v5 (REST): put /form', async t => {
  t.plan(10)
  let request = reqs.arc5.put
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('Architect v5 (REST): patch /form', async t => {
  t.plan(10)
  let request = reqs.arc5.patch
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('Architect v5 (REST): delete /form', async t => {
  t.plan(10)
  let request = reqs.arc5.delete
  let req
  let fn = async request => {
    req = request
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(request)
  check({ req, request, t, deprecated: true })
})

test('arc.middleware should allow the mutation of request object between middleware functions', t => {
  t.plan(1)
  let request = reqs.arc5.getIndex
  let req = JSON.parse(str(request))
  function one (req) {
    req.body = req.body || {}
    req.body.munge = true
    return req
  }
  function two (req) {
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
  async function one (req) {
    gotOne = req
    return
  }
  let gotTwo
  async function two (req) {
    gotTwo = req
    return { statusCode: 200 }
  }
  let req = JSON.parse(str(request))
  let handler = arc.http.async(one, two)
  await handler(req)
  t.equal(str(gotOne), str(gotTwo), match('second function request', `${str(gotTwo).substr(0, 50)}...`))
})

test('Teardown', t => {
  t.plan(1)
  // Unset env var for future testing (ostensibly)
  delete process.env.SESSION_TABLE_NAME
  t.pass('Done')
})
