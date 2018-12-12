var test = require('tape')
var arc = require('../')

function clone(object) {
  return JSON.parse(JSON.stringify(object))
}

const MOCK_REQUEST = {
  body: {},
  path: '/',
  method: 'GET',
  params: {},
  query: {},
  headers: {}
}

const MOCK_RESPONSE = {
  status: 200,
  type: 'application/JSON',
  body: {}
}

function returnsModifiedRequest(request) {
  request.isModified = true
  return request
}

function returnsNothing() {}

function returnsResponse(request) {
  var response = clone(MOCK_RESPONSE)
  if (request.isModified) {
    response.body = {
      didYouModifyTheRequest: true
    }
  }
  return response
}

function fails() {
  throw new Error(`This middleware should never be run`)
}

test('modified requests are passed along the middleware chain', async t => {
  t.plan(1)
  try {
    var combined = arc.middleware(returnsModifiedRequest, returnsNothing, returnsResponse)
    var response = await combined(MOCK_REQUEST)
    t.ok(response.body.didYouModifyTheRequest)
  } catch (e) {
    t.fail(e)
  }
})

test('we exit on first response', async t => {
  t.plan(1)
  try {
    var combined = arc.middleware(returnsResponse, fails)
    var response = await combined(MOCK_REQUEST)
    t.ok(response.body)
  } catch (e) {
    t.fail(e)
  }
})

test('error thrown when middleware chain does not return a response', async t => {
  t.plan(1)
  try {
    var combined = arc.middleware(returnsModifiedRequest, returnsNothing)
    var response = await combined(MOCK_REQUEST)
    // This will fail here
  } catch (e) {
    t.ok(e, 'failed as expected')
    console.log(e)
  }
})
