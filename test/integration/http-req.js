let http = require('../../src').http
let interpolate = require('../../src/http/helpers/params')
let test = require('tape')
let reqs = require('./http-req-fixtures')

let str = i => JSON.stringify(i)

test('Set up env', t => {
  t.plan(2)
  t.ok(http, 'Loaded HTTP')
  t.ok(reqs, 'Loaded request fixtures')
})

test('Architect v5: get /', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.getIndex
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(request.path, req.path, `path matches: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
            `queryStringParameters matches: ${str(req.queryStringParameters)}`)
    t.ok(req.session, 'session is present')
    res({html:'Ok!'})
  })
  handler(request, {}, end)
})

test('Architect v5: get /?whats=up', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.getWithQueryString
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(request.path, req.path, `path matches: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
            `queryStringParameters matches: ${str(req.queryStringParameters)}`)
    t.ok(req.session, 'session is present')
    res({html:'Ok!'})
  })
  handler(request, {}, end)
})

test('Architect v5: get /nature/hiking', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.getWithParam
  let parsed = interpolate(request)
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(parsed.path, req.path, `path interpolated: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
            `queryStringParameters matches: ${str(req.queryStringParameters)}`)
    t.ok(req.session, 'session is present')
    res({html:'Ok!'})
  })
  handler(request, {}, end)
})

test('Architect v5: post /form (JSON / form URL-encoded)', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.post
  let parsed = interpolate(request)
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(parsed.path, req.path, `path interpolated: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
            `queryStringParameters matches: ${str(req.queryStringParameters)}`)
    t.ok(req.session, 'session is present')
    res({html:'Ok!'})
  })
  handler(request, {}, end)
})

test('Architect v5: post /form (multipart form data-encoded)', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.postBinary
  let parsed = interpolate(request)
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(parsed.path, req.path, `path interpolated: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
      `queryStringParameters matches: ${str(req.queryStringParameters)}`)
      t.ok(req.session, 'session is present')
      res({html:'Ok!'})
    })
    handler(request, {}, end)
  })

test('Architect v5: put /form', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.put
  let parsed = interpolate(request)
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(parsed.path, req.path, `path interpolated: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
            `queryStringParameters matches: ${str(req.queryStringParameters)}`)
    t.ok(req.session, 'session is present')
    res({html:'Ok!'})
  })
  handler(request, {}, end)
})

test('Architect v5: patch /form', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.patch
  let parsed = interpolate(request)
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(parsed.path, req.path, `path interpolated: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
            `queryStringParameters matches: ${str(req.queryStringParameters)}`)
    t.ok(req.session, 'session is present')
    res({html:'Ok!'})
  })
  handler(request, {}, end)
})

test('Architect v5: delete /form', t => {
  t.plan(10)
  let end = () => t.ok(true, 'Final callback called')

  let request = reqs.arc5.delete
  let parsed = interpolate(request)
  let handler = http((req,res) => {
    t.equal(request.body, req.body, `body matches: ${str(req.body)}`)
    t.equal(parsed.path, req.path, `path interpolated: ${str(req.path)}`)
    t.equal(request.headers, req.headers, `headers matches: ${str(req.headers)}`)
    t.equal(request.method, req.method, `method matches: ${str(req.method)}`)
    t.equal(request.httpMethod, req.httpMethod, `httpMethod matches: ${str(req.httpMethod)}`)
    t.equal(request.params, req.params, `params matches: ${str(req.params)}`)
    t.equal(request.query, req.query, `query matches: ${str(req.query)}`)
    t.equal(request.queryStringParameters, req.queryStringParameters,
            `queryStringParameters matches: ${str(req.queryStringParameters)}`)
    t.ok(req.session, 'session is present')
    res({html:'Ok!'})
  })
  handler(request, {}, end)
})
