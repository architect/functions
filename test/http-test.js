let test = require('tape')
let arc = require('../')
let sandbox = require('@architect/sandbox')

let end
test('env', async t=> {
  t.plan(1)
  end = await sandbox.start()
  setTimeout(function() {
    t.ok(arc, 'gotta arc')
  }, 200)
})

// test arc.http runs middleware
let count = 0
function one(req, res, next) {
  count += 1
  next()
}
function two(req, res, next) {
  count += 1
  next()
}
function three(req, res, next) {
  count += 1
  res({json:count})
}
test('arc.http express-style middleware', t=> {
  t.plan(2)
  let lambda = arc.http(one, two, three)
  let req = {headers:{}}
  let context = {}
  lambda(req, context, function done(err, result) {
    t.ok(true, 'done called')
    t.ok(count === 3, 'all middleware ran')
  })
})

// test default response is json
// test res(Error)
// test res({location})
// test res({html})
// test res({css})
// test res({js})
// test res({text})
// test res({json})
// test res({xml})
// test res({session})
//  -- test result cookie
test('end', t=> {
  t.plan(1)
  end()
  t.ok(true, 'ended')
})
