const test = require('tape')
const sinon = require('sinon')
const mockSqsEvent = require('../../../mock/mock-sqs-event.json')
let subscribe

test('Set up env', (t) => {
  t.plan(1)

  const arc = require('../../../..')
  subscribe = arc.queues.subscribe
  t.ok(subscribe, 'Got queues.subscribe method')
})

test('queues.subscribe calls handler', (t) => {
  t.plan(1)

  const eventHandler = sinon.fake.yields()

  // get a lambda signature from the handler
  const handler = subscribe(eventHandler)

  // invoke the lambda handler with mock payloads
  const mockContext = {}
  handler(mockSqsEvent, mockContext, function _handler(err) {
    if (err) {
      t.fail(err)
    } else {
      t.ok(eventHandler.calledOnce, 'event handler called once')
    }
  })
})

test('queues.subscribe calls async handler', async (t) => {
  t.plan(1)

  const fake = sinon.fake()

  // get a lambda signature from the handler

  const handler = subscribe(async (json) => {
    fake(json)
  })

  // invoke the lambda handler with mock payloads
  await handler(mockSqsEvent)
  t.ok(fake.calledOnce, 'event handler called once')
})

test('Teardown', (t) => {
  t.plan(1)
  delete process.env.ARC_ENV
  t.pass('Done!')
})
