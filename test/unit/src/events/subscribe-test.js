const test = require('tape')
const sinon = require('sinon')
let subscribe

test('Set up env', (t) => {
  t.plan(1)

  const arc = require('../../../..')
  subscribe = arc.events.subscribe
  t.ok(subscribe, 'Got events.subscribe method')
})

test('events.subscribe should invoke provided handler for each SNS event Record', (t) => {
  t.plan(2)
  const fake = sinon.fake.yields()
  const handler = subscribe(fake)
  handler(
    {
      Records: [{ Sns: { Message: '{"hey":"there"}' } }, { Sns: { Message: '{"sup":"bud"}' } }],
    },
    {},
    (err) => {
      if (err) t.fail(err)
      else {
        t.ok(fake.calledWith({ hey: 'there' }), 'subscribe handler called with first SNS record')
        t.ok(fake.calledWith({ sup: 'bud' }), 'subscribe handler called with second SNS record')
      }
    },
  )
})

test('events.subscribe should invoke provided handler for each SNS event Record when handler is async', async (t) => {
  t.plan(2)
  const fake = sinon.fake()
  const handler = subscribe(async (json) => {
    await fake(json)
  })
  await handler({
    Records: [{ Sns: { Message: '{"hey":"there"}' } }, { Sns: { Message: '{"sup":"bud"}' } }],
  })
  t.ok(fake.calledWith({ hey: 'there' }), 'subscribe handler called with first SNS record')
  t.ok(fake.calledWith({ sup: 'bud' }), 'subscribe handler called with second SNS record')
})

test('events.subscribe should fall back to an empty event if one is not provided', (t) => {
  t.plan(1)
  const fake = sinon.fake.yields()
  const handler = subscribe(fake)
  handler(null, {}, (err) => {
    if (err) t.fail(err)
    else {
      t.ok(fake.calledWith({}), 'subscribe handler called with empty SNS record')
    }
  })
})

test('events.subscribe should fall back to an empty event if one is not provided (async)', async (t) => {
  t.plan(1)
  const fake = sinon.fake()
  const handler = subscribe(async (json) => {
    await fake(json)
  })
  await handler()
  t.ok(fake.calledWith({}), 'subscribe handler called with empty SNS record')
})

test('Teardown', (t) => {
  t.plan(1)
  delete process.env.ARC_ENV
  t.pass('Done!')
})
