const { test } = require('node:test')
const assert = require('node:assert')
let mockSqsEvent = require('../../../mock/mock-sqs-event.json')
let subscribe

// Simple function tracker to replace sinon
function createFake() {
  const calls = []
  let callCount = 0
  const fake = function(...args) {
    calls.push(args)
    callCount++
    if (fake._callback) {
      fake._callback(...args)
    }
  }
  fake.calledOnce = () => callCount === 1
  fake.yields = () => {
    fake._callback = function(...args) {
      const callback = args[args.length - 1]
      if (typeof callback === 'function') {
        callback()
      }
    }
    return fake
  }
  return fake
}

test('Set up env', () => {
  let arc = require('../../../..')
  subscribe = arc.queues.subscribe
  assert.ok(subscribe, 'Got queues.subscribe method')
})

test('queues.subscribe calls handler', (t, done) => {
  let eventHandler = createFake().yields()

  // get a lambda signature from the handler
  let handler = subscribe(eventHandler)

  // invoke the lambda handler with mock payloads
  let mockContext = {}
  handler(mockSqsEvent, mockContext, function _handler (err) {
    if (err) {
      assert.fail(err)
    }
    else {
      assert.ok(eventHandler.calledOnce(), 'event handler called once')
    }
    done()
  })
})

test('queues.subscribe calls async handler', async () => {
  let fake = createFake()

  // get a lambda signature from the handler

  let handler = subscribe(async function (json) {
    fake(json)
  })

  // invoke the lambda handler with mock payloads
  await handler(mockSqsEvent)
  assert.ok(fake.calledOnce(), 'event handler called once')
})

test('Teardown', () => {
  delete process.env.ARC_ENV
  assert.ok(true, 'Done!')
})
