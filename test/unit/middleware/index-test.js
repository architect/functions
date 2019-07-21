let test = require('tape')
let sinon = require('sinon')
let middleware = require('../../../src/middleware')

test('arc.middleware should allow for munging and passing a request object between different middleware layers', t => {
  t.plan(1)
  let one = function (req) {
    req.body = req.body || {}
    req.body.munge = true
    return req
  }
  let two = function (req) {
    t.ok(req.body.munge, 'request object was munged and passed through middleware')
    return { statusCode: 200, body: req.body }
  }
  let handler = middleware(one, two)
  handler({httpMethod: 'GET'})
})

test('arc.middleware should prevent further middleware processing when a response is returned', t => {
  t.plan(1)
  let one = function () { return { statusCode: 200 } }
  let two = sinon.fake()
  let handler = middleware(one, two)
  handler({httpMethod: 'GET'})
  t.notOk(two.callCount, 'second middleware not called')
})

test('arc.middleware should throw if no middleware returns a response', async t => {
  t.plan(1)
  let one = function (req) { return req }
  let two = function (req) { return req }
  let handler = middleware(one, two)
  try {
    await handler({httpMethod: 'GET'})
  } catch (e) {
    t.ok(e, 'exception thrown')
    t.end()
  }
})

test('arc.middleware should pass original request if layer does not return anything', async t => {
  t.plan(1)
  let one = function () { return }
  let two = sinon.fake.returns({statusCode: 200})
  let request = {httpMethod: 'GET', querystringParameters: {q: 'poop'}}
  let handler = middleware(one, two)
  try {
    await handler(request)
  } catch (e) {
    t.fail(e, 'exception thrown')
  }
  t.ok(two.calledWith(request), 'second middleware layer called with origin request object')
})
