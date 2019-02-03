var test = require('tape')
var arc = require('../')

test('env', t=> {
  t.plan(1)
  t.ok(arc, 'gotta arc')
})

