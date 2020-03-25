let test = require('tape')
let sinon = require('sinon')
let subscribe = require('../../../../src/events/subscribe')

test('events.subscribe should invoke provided handler for each SNS event Record', t => {
  t.plan(2)
  let fake = sinon.fake.yields()
  let handler = subscribe(fake)
  handler({
    Records: [{Sns:{Message:'{"hey":"there"}'}}, {Sns:{Message:'{"sup":"bud"}'}}]
  }, {}, function(err) {
    if (err) t.fail(err)
    else {
      t.ok(fake.calledWith({hey:"there"}), 'subscribe handler called with first SNS record')
      t.ok(fake.calledWith({sup:"bud"}), 'subscribe handler called with second SNS record')
    }
  })
})

test('events.subscribe should invoke provided handler for each SNS event Record when handler is async', async t => {
  t.plan(2)
  let fake = sinon.fake()
  let handler = subscribe(async function(json) {
    fake(json)
  })
  await handler({
    Records: [{Sns:{Message:'{"hey":"there"}'}}, {Sns:{Message:'{"sup":"bud"}'}}]
  })
  t.ok(fake.calledWith({hey:"there"}), 'subscribe handler called with first SNS record')
  t.ok(fake.calledWith({sup:"bud"}), 'subscribe handler called with second SNS record')
})

test('events.subscribe should fall back to an empty event if one is not provided', t => {
  t.plan(1)
  let fake = sinon.fake.yields()
  let handler = subscribe(fake)
  handler(null, {}, function(err) {
    if (err) t.fail(err)
    else {
      t.ok(fake.calledWith({}), 'subscribe handler called with empty SNS record')
    }
  })
})

test('events.subscribe should fall back to an empty event if one is not provided (async)', async t => {
  t.plan(1)
  let fake = sinon.fake()
  let handler = subscribe(async function(json) {
    fake(json)
  })
  await handler()
  t.ok(fake.calledWith({}), 'subscribe handler called with empty SNS record')
})
