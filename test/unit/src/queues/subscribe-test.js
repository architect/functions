let test = require('tape')
let sinon = require('sinon')
let subscribe = require('../../../../src/queues/subscribe')
let mockSqsEvent = require('../../../mock/mock-sqs-event.json')

test('queues.subscribe calls handler', t=> {
  t.plan(1)

  let eventHandler = sinon.fake.yields()

  // get a lambda signature from the handler
  let handler = subscribe(eventHandler)

  // invoke the lambda handler with mock payloads
  let mockContext = {}
  handler(mockSqsEvent, mockContext, function _handler(err) {
    if (err) {
      t.fail(err)
    } else {
      t.ok(eventHandler.calledOnce, 'event handler called once')
    }
  })
})

test('queues.subscribe calls async handler', async t=> {
  t.plan(1)

  let fake = sinon.fake()

  // get a lambda signature from the handler
  let handler = subscribe(async function(json) {
    fake(json)
  })

  // invoke the lambda handler with mock payloads
  await handler(mockSqsEvent)
  t.ok(fake.calledOnce, 'event handler called once')
})
