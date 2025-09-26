const { test } = require('node:test')
const assert = require('node:assert')
let publish

test('Set up env', () => {
  let arc = require('../../../..')
  publish = arc.queues.publish
  assert.ok(publish, 'Got queues.publish method')
})

test('queues.publish should throw if there is no parameter name', () => {
  assert.throws(() => { publish({}) }, /missing params.name/, 'throws missing name parameter exception')
})

test('queues.publish should throw if there is no parameter payload', () => {
  assert.throws(() => { publish({ name: 'batman' }) }, /missing params.payload/, 'throws missing payload parameter exception')
})

test('Teardown', () => {
  delete process.env.ARC_ENV
  assert.ok(true, 'Done!')
})
