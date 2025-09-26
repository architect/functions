const { test } = require('node:test')
const assert = require('node:assert')
let publish

test('Set up env', () => {
  let arc = require('../../../..')
  publish = arc.events.publish
  assert.ok(publish, 'Got events.publish method')
})

test('events.publish should throw if there is no parameter name', () => {
  assert.throws(() => { publish({}) }, /missing params.name/, 'throws missing name parameter exception')
})

test('events.publish should throw if there is no parameter payload', () => {
  assert.throws(() => { publish({ name: 'batman' }) }, /missing params.payload/, 'throws missing payload parameter exception')
})

test('Teardown', () => {
  delete process.env.ARC_ENV
  assert.ok(true, 'Done!')
})
