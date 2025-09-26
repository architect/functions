let { join } = require('path')
let { deepStrictEqual } = require('assert')
let sut = join(process.cwd(), 'src')
let { test } = require('node:test')
let assert = require('node:assert')
let arc

let reqs = require('@architect/req-res-fixtures').http.req

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
  query: 'queryStringParameters',
}

let requestsTested = []

let copy = obj => JSON.parse(JSON.stringify(obj))

function check ({ req, request }) {
  console.log(`Got request:`, req)
  requestsTested.push(request)

  // Make sure all original keys are present and accounted for
  Object.keys(request).forEach(key => {
    // eslint-disable-next-line
    if (!req.hasOwnProperty(key)) assert.fail(`Original request param missing from interpolated request: ${key}`)
  })
  Object.entries(req).forEach(([ key, val ]) => {
    // Make sure we don't have any false positives matching undefined tests
    if (req[key] === undefined) assert.fail(`Property is undefined: ${key}`)
    // Compare mutation of nulls into objects
    if (isNulled(key) && request[key] === null) {
      if (unNulled(request[key], val)) {
        assert.ok(true, match(`req.${key}`, req[key]))
      }
      else {
        assert.fail(`Param not un-nulled: ${key}: ${val}`)
      }
    }
    else {
      assert.strictEqual(str(val), str(req[key]), match(`req.${key}`, str(req[key])))
    }
    // Compare interpolation to nicer, backwards compat req params
    if (arc6RestPrettyParams[key]) {
      assert.strictEqual(str(req[arc6RestPrettyParams[key]]), str(req[key]), `req.${key} == req.${arc6RestPrettyParams[key]}`)
    }
  })
  assert.ok(req.session, 'req.session is present')
}

test('Set up env', () => {
  // Set env var to keep from stalling on db reads in CI
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'

  arc = require(sut)
  assert.ok(arc.http, 'Loaded HTTP')
  assert.ok(arc.http.async, 'Loaded legacy async method')
})

test('Architect v7 (HTTP): get /', async () => {
  let request = reqs.arc7.getIndex
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get /?whats=up', async () => {
  let request = reqs.arc7.getWithQueryString
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get /?whats=up&whats=there', async () => {
  let request = reqs.arc7.getWithQueryStringDuplicateKey
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get /nature/hiking', async () => {
  let request = reqs.arc7.getWithParam
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get /{proxy+} (/nature/hiking)', async () => {
  let request = reqs.arc7.getProxyPlus
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get /$default', async () => {
  let request = reqs.arc7.get$default
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get /path/* (/path/hi/there)', async () => {
  let request = reqs.arc7.getCatchall
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get /:activities/{proxy+} (/nature/hiking/wilderness)', async () => {
  let request = reqs.arc7.getWithParamAndCatchall
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get / with brotli compression', async () => {
  let request = reqs.arc7.getWithBrotli
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): get / with gzip compression', async () => {
  let request = reqs.arc7.getWithGzip
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): post /form (JSON)', async () => {
  let request = reqs.arc7.postJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): post /form (form URL encoded)', async () => {
  let request = reqs.arc7.postFormURL
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): post /form (multipart form data)', async () => {
  let request = reqs.arc7.postMultiPartFormData
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): post /form (octet stream)', async () => {
  let request = reqs.arc7.postOctetStream
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): put /form (JSON)', async () => {
  let request = reqs.arc7.putJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): patch /form (JSON)', async () => {
  let request = reqs.arc7.patchJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v7 (HTTP): delete /form (JSON)', async () => {
  let request = reqs.arc7.deleteJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

/**
 * Arc 6 REST tests for compatibility with Lambda proxy integration signature changes, such as:
 * - `nulls` passed instead of empty objects
 * - All bodies are base64 encoded
 */
test('Architect v6 (REST): get /', async () => {
  let request = reqs.arc6.getIndex
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): get /?whats=up', async () => {
  let request = reqs.arc6.getWithQueryString
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): get /?whats=up&whats=there', async () => {
  let request = reqs.arc6.getWithQueryStringDuplicateKey
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): get /nature/hiking', async () => {
  let request = reqs.arc6.getWithParam
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): get /{proxy+}', async () => {
  let request = reqs.arc6.getProxyPlus
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): get /path/* (/path/hi/there)', async () => {
  let request = reqs.arc6.getCatchall
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): get /:activities/{proxy+} (/nature/hiking/wilderness)', async () => {
  let request = reqs.arc6.getWithParamAndCatchall
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): post /form (JSON)', async () => {
  let request = reqs.arc6.postJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): post /form (form URL encoded)', async () => {
  let request = reqs.arc6.postFormURL
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): post /form (multipart form data)', async () => {
  let request = reqs.arc6.postMultiPartFormData
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): post /form (octet stream)', async () => {
  let request = reqs.arc6.postOctetStream
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): put /form (JSON)', async () => {
  let request = reqs.arc6.putJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): patch /form (JSON)', async () => {
  let request = reqs.arc6.patchJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Architect v6 (REST): delete /form (JSON)', async () => {
  let request = reqs.arc6.deleteJson
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('arc.http should allow the mutation of request object between middleware functions', () => {
  let request = reqs.arc7.getIndex
  let req = copy(request)
  async function one (req) {
    req.body = req.body || {}
    req.body.munge = true
    return req
  }
  async function two (req) {
    assert.ok(req.body.munge, 'request object was mutated in middleware')
    return { statusCode: 200, body: req.body }
  }
  let handler = arc.http(one, two)
  handler(req)
})

test('arc.http should pass along original request if function does not return', async () => {
  let request = reqs.arc7.getIndex
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
  let req = copy(request)
  let handler = arc.http(one, two)
  await handler(req)
  assert.strictEqual(str(gotOne), str(gotTwo), match('second function request', `${str(gotTwo).substr(0, 50)}...`))
})

test('Verify all Arc v7 (HTTP) + Arc v6 (REST) request fixtures were tested', () => {
  let tester = ([ name, req ]) => {
    assert.ok(requestsTested.some(tested => {
      try {
        deepStrictEqual(req, tested)
        return true
      }
      catch { /* noop */ }
    }), `Tested req: ${name}`)
  }
  console.log(`Arc 7 requests`)
  Object.entries(reqs.arc7).forEach(tester)
  console.log(`Arc 6 requests`)
  Object.entries(reqs.arc6).forEach(tester)
})

test('Verify legacy arc.http.async method still works', async () => {
  let request = reqs.arc7.getIndex
  let req
  let fn = async event => {
    req = event
    return basicResponse
  }
  let handler = arc.http.async(fn)
  await handler(copy(request))
  check({ req, request: copy(request) })
})

test('Teardown', () => {
  delete process.env.ARC_ENV
  delete process.env.ARC_SESSION_TABLE_NAME
  assert.ok(true, 'Done')
})
