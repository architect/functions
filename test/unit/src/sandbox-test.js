let test = require('tape')
const { versionGTE } = require('../../../src/sandbox')

test('versionGTE', t => {
  t.plan(7)
  t.true(versionGTE('1.0.0', '1.0.0'), 'equal')
  t.false(versionGTE('1.0.0', '1.0.1'), 'less than patch')
  t.true(versionGTE('1.0.1', '1.0.0'), 'greater than patch')
  t.false(versionGTE('1.0.0', '1.1.0'), 'less than minor')
  t.false(versionGTE('1.0.0', '2.0.0'), 'less than major')
  t.false(versionGTE('1.3.0', '2.2.2'), 'less than all')
  t.true(versionGTE('2.0.0', '1.0.0'), 'greater than')
})
