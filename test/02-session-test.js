var read = require('../src/http/session/read')
var write = require('../src/http/session/read')
let test= require('tape')

test('http.session', t=> {
  t.plan(2)
  t.ok(read, 'http.session.read')
  t.ok(write, 'http.session.write')
})
