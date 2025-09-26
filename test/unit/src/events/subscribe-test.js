const { test } = require('node:test')
const assert = require('node:assert')
let subscribe

// Simple function tracker to replace sinon
function createFake() {
  const calls = []
  const fake = function(...args) {
    calls.push(args)
    if (fake._callback) {
      fake._callback(...args)
    }
  }
  fake.calledWith = (expectedArg) => {
    return calls.some(call => JSON.stringify(call[0]) === JSON.stringify(expectedArg))
  }
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
  subscribe = arc.events.subscribe
  assert.ok(subscribe, 'Got events.subscribe method')
})

test('events.subscribe should invoke provided handler for each SNS event Record', (t, done) => {
  let fake = createFake().yields()
  let handler = subscribe(fake)
  handler({
    Records: [ { Sns: { Message: '{"hey":"there"}' } }, { Sns: { Message: '{"sup":"bud"}' } } ],
  }, {}, function (err) {
    if (err) assert.fail(err)
    else {
      assert.ok(fake.calledWith({ hey: 'there' }), 'subscribe handler called with first SNS record')
      assert.ok(fake.calledWith({ sup: 'bud' }), 'subscribe handler called with second SNS record')
    }
    done()
  })
})

test('events.subscribe should invoke provided handler for each SNS event Record when handler is async', async () => {
  let fake = createFake()
  let handler = subscribe(async function (json) {
    await fake(json)
  })
  await handler({
    Records: [ { Sns: { Message: '{"hey":"there"}' } }, { Sns: { Message: '{"sup":"bud"}' } } ],
  })
  assert.ok(fake.calledWith({ hey: 'there' }), 'subscribe handler called with first SNS record')
  assert.ok(fake.calledWith({ sup: 'bud' }), 'subscribe handler called with second SNS record')
})

test('events.subscribe should fall back to an empty event if one is not provided', (t, done) => {
  let fake = createFake().yields()
  let handler = subscribe(fake)
  handler(null, {}, function (err) {
    if (err) assert.fail(err)
    else {
      assert.ok(fake.calledWith({}), 'subscribe handler called with empty SNS record')
    }
    done()
  })
})

test('events.subscribe should fall back to an empty event if one is not provided (async)', async () => {
  let fake = createFake()
  let handler = subscribe(async function (json) {
    await fake(json)
  })
  await handler()
  assert.ok(fake.calledWith({}), 'subscribe handler called with empty SNS record')
})

test('Teardown', () => {
  delete process.env.ARC_ENV
  assert.ok(true, 'Done!')
})
