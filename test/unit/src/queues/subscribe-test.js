let test = require('tape')
let sinon = require('sinon')
let mockSqsEvent = require('../../../mock/mock-sqs-event.json')
let subscribe

test('Set up env', t => {
  t.plan(1)
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: {} })
  // eslint-disable-next-line
  let arc = require('../../../..')
  subscribe = arc.queues.subscribe
  t.ok(subscribe, 'Got queues.subscribe method')
})

test('queues.subscribe calls handler', t => {
  t.plan(1)

  let eventHandler = sinon.fake.yields()

  // get a lambda signature from the handler
  let handler = subscribe(eventHandler)

  // invoke the lambda handler with mock payloads
  let mockContext = {}
  handler(mockSqsEvent, mockContext, function _handler (err) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(eventHandler.calledOnce, 'event handler called once')
    }
  })
})

test('queues.subscribe calls async handler', async t => {
  t.plan(1)

  let fake = sinon.fake()

  // get a lambda signature from the handler
  // eslint-disable-next-line
  let handler = subscribe(async function (json) {
    fake(json)
  })

  // invoke the lambda handler with mock payloads
  await handler(mockSqsEvent)
  t.ok(fake.calledOnce, 'event handler called once')
})

test('Teardown', t => {
  t.plan(1)
  delete process.env.ARC_ENV
  delete process.env.ARC_SANDBOX
  t.pass('Done!')
})
