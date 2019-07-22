let test = require('tape')
let sinon = require('sinon')
let http = require('../../../src/http/http')

test('arc.http express-style middleware', t=> {
  // test arc.http runs middleware
  process.env.SESSION_TABLE_NAME = 'jwe' // if we drop this / wanna use ddb, we cant, but we need to run a sandbox instance, then.
  let one = sinon.fake.yields()
  let two = sinon.fake.yields()
  let three = sinon.fake((req, res) => res({body:'hey now'}))
  t.plan(5)
  let lambda = http(one, two, three)
  let req = {headers:{}}
  let context = {}
  lambda(req, context, function done(err, result) {
    t.notOk(err, 'no error producted')
    t.ok(one.calledOnce, 'first middleware called exactly once')
    t.ok(two.calledOnce, 'second middleware called exactly once')
    t.ok(three.calledOnce, 'third middleware called exactly once')
    t.comment(JSON.stringify(result))
    t.equals(result.body, 'hey now', 'final handler returned result that was invoked via `res` within one of the middlewares')
  })
})
