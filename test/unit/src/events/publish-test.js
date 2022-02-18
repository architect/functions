let test = require('tape')
let publish

test('Set up env', t => {
  t.plan(1)
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: {}, version: '5.0.0' })
  // eslint-disable-next-line
  let arc = require('../../../..')
  publish = arc.events.publish
  t.ok(publish, 'Got events.publish method')
})

test('events.publish should throw if there is no parameter name', t => {
  t.plan(1)
  t.throws(() => { publish({}) }, /missing params.name/, 'throws missing name parameter exception')
})

test('events.publish should throw if there is no parameter payload', t => {
  t.plan(1)
  t.throws(() => { publish({ name: 'batman' })}, /missing params.payload/, 'throws missing payload parameter exception')
})

test('Teardown', t => {
  t.plan(1)
  delete process.env.ARC_ENV
  delete process.env.ARC_SANDBOX
  t.pass('Done!')
})
