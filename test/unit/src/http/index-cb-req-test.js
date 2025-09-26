let { join } = require('path')
let { deepStrictEqual } = require('assert')
let sut = join(process.cwd(), 'src')
let { test } = require('node:test')
let assert = require('node:assert')
let http

let reqs = require('@architect/req-res-fixtures').http.req

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
  query: 'queryStringParameters',
}

let requestsTested = []

let copy = obj => JSON.parse(JSON.stringify(obj))

function check ({ req, request, res }) {
  console.log(`Got request:`, req)
  requestsTested.push(request)

  // Make sure all original keys are present and accounted for
  Object.keys(request).forEach(key => {
    // eslint-disable-next-line
    if (!req.hasOwnProperty(key)) assert.fail(`Original request param missing from interpolated request: ${key}`)
  })

  if (request.body) assert.ok(req.rawBody, 'Body property also created rawBody')
  else assert.ok(!req.rawBody, 'Did not populate rawBody without a body present')

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
  res(basicResponse)
}

test('Set up env', () => {
  // Set env var to keep from stalling on db reads in CI
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'

  let arc = require(sut)
  http = arc.http
  assert.ok(http, 'Loaded HTTP')
})

test('Architect v7 (HTTP): get /', (t, done) => {
  let request = reqs.arc7.getIndex
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get /?whats=up', (t, done) => {
  let request = reqs.arc7.getWithQueryString
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get /?whats=up&whats=there', (t, done) => {
  let request = reqs.arc7.getWithQueryStringDuplicateKey
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get /nature/hiking', (t, done) => {
  let request = reqs.arc7.getWithParam
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get /{proxy+} (/nature/hiking)', (t, done) => {
  let request = reqs.arc7.getProxyPlus
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get /$default', (t, done) => {
  let request = reqs.arc7.get$default
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get /path/* (/path/hi/there)', (t, done) => {
  let request = reqs.arc7.getCatchall
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get /:activities/{proxy+} (/nature/hiking/wilderness)', (t, done) => {
  let request = reqs.arc7.getWithParamAndCatchall
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get / with brotli compression', (t, done) => {
  let request = reqs.arc7.getWithBrotli
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): get / with gzip compression', (t, done) => {
  let request = reqs.arc7.getWithGzip
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): post /form (JSON)', (t, done) => {
  let request = reqs.arc7.postJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): post /form (form URL encoded)', (t, done) => {
  let request = reqs.arc7.postFormURL
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): post /form (multipart form data)', (t, done) => {
  let request = reqs.arc7.postMultiPartFormData
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): post /form (octet stream)', (t, done) => {
  let request = reqs.arc7.postOctetStream
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): put /form (JSON)', (t, done) => {
  let request = reqs.arc7.putJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): patch /form (JSON)', (t, done) => {
  let request = reqs.arc7.patchJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v7 (HTTP): delete /form (JSON)', (t, done) => {
  let request = reqs.arc7.deleteJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

/**
 * Arc 6 REST tests for compatibility with Lambda proxy integration signature changes, such as:
 * - `nulls` passed instead of empty objects
 * - All bodies are base64 encoded
 */
test('Architect v6 (REST): get /', (t, done) => {
  let request = reqs.arc6.getIndex
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): get /?whats=up', (t, done) => {
  let request = reqs.arc6.getWithQueryString
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): get /?whats=up&whats=there', (t, done) => {
  let request = reqs.arc6.getWithQueryStringDuplicateKey
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): get /nature/hiking', (t, done) => {
  let request = reqs.arc6.getWithParam
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): get /{proxy+}', (t, done) => {
  let request = reqs.arc6.getProxyPlus
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): get /path/* (/path/hi/there)', (t, done) => {
  let request = reqs.arc6.getCatchall
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): get /:activities/{proxy+} (/nature/hiking/wilderness)', (t, done) => {
  let request = reqs.arc6.getWithParamAndCatchall
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): post /form (JSON)', (t, done) => {
  let request = reqs.arc6.postJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): post /form (form URL encoded)', (t, done) => {
  let request = reqs.arc6.postFormURL
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): post /form (multipart form data)', (t, done) => {
  let request = reqs.arc6.postMultiPartFormData
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): post /form (octet stream)', (t, done) => {
  let request = reqs.arc6.postOctetStream
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): put /form (JSON)', (t, done) => {
  let request = reqs.arc6.putJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): patch /form (JSON)', (t, done) => {
  let request = reqs.arc6.patchJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
})

test('Architect v6 (REST): delete /form (JSON)', (t, done) => {
  let request = reqs.arc6.deleteJson
  let handler = http((req, res) => {
    check({ req, request: copy(request), res })
    assert.ok(true, 'Final callback called')
    done()
  })
  handler(copy(request), {}, () => {})
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

test('Teardown', () => {
  delete process.env.ARC_ENV
  delete process.env.ARC_SESSION_TABLE_NAME
  assert.ok(true, 'Done')
})
