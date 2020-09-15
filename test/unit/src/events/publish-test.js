let test = require('tape')
let publish = require('../../../../src/events/publish')

test('events.publish should throw if there is no parameter name', t => {
  t.plan(1)
  t.throws(() => { publish({}) }, /missing params.name/, 'throws missing name parameter exception')
})

test('events.publish should throw if there is no parameter payload', t => {
  t.plan(1)
  t.throws(() => { publish({ name: 'batman' })}, /missing params.payload/, 'throws missing payload parameter exception')
})
