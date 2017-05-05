var test = require('tape')
var getIAM = require('../src/generators/_get-iam-role.js')

test('get iam', t=> {
  t.plan(1)
  getIAM(function _iam(err, role) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(role, 'got role')
      console.log(role)
    }
  })
})
