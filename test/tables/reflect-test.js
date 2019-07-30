let sandbox = require('@architect/sandbox')
let test = require('tape')
let reflect = require('../reflect')

let data
test('reflect data', async t=> {
  t.plan(5)
  t.ok(reflect, 'can reflect')
  try {
    data = await reflect()
    t.ok(data, 'got data')
    t.ok(data.hashids, 'has hashids defined')
    t.ok(data._db, 'testqpp._db exists')
    t.ok(data._doc, 'testqpp._doc exists')
    console.log(data)
  }
  catch(e) {
    t.fail(e)
  }
})


let server
test('starts the db server', t=> {
  t.plan(1)
  server = sandbox.db.start(function _start() {
    t.ok(true, 'started db server')
  })
})

test('put', async t=>{
  t.plan(1)
  let item = await data.hashids.put({
    id: 'fake',
    foo: 'bar',
    baz: {
      one: 1,
      doe: true
    }
  })
  t.ok(item, 'returned item')
  console.log(item)
})

test('get', async t=> {
  t.plan(2)
  let result = await data.hashids.get({
    id: 'fake'
  })
  t.ok(result, 'got result')
  t.ok(result.baz.doe, 'result.baz.doe deserialized')
  console.log(result)
})

test('server closes', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'closed')
})
