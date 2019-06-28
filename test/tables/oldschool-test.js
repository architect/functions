var test = require('tape')
var parallel = require('run-parallel')
var sandbox = require('@architect/sandbox')
var testapp = require('../')

test('env', t=> {
  t.plan(1)
  t.ok(testapp, 'got data')
})

var server
test('starts the db server', t=> {
  t.plan(1)
  server = sandbox.db.start(function _start() {
    t.ok(true, 'started db server')
  })
})


test('put', t=>{
  t.plan(6)
  t.ok(testapp, 'got data')
  t.ok(testapp.hashids, 'has hashids defined')
  console.log(testapp)
  t.ok(testapp._name, 'testqpp._name exists')
  t.ok(testapp._db, 'testqpp._db exists')
  t.ok(testapp._doc, 'testqpp._doc exists')
  testapp.hashids.put({
    id: 'fake',
    foo: 'bar',
    baz: {
      one: 1,
      doe: true
    }
  },
  function _put(err, item) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(item, 'returned item')
      console.log(item)
    }
  })
})

test('get', t=> {
  t.plan(2)
  testapp.hashids.get({
    id: 'fake'
  },
  function _get(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'got result')
      t.ok(result.baz.doe, 'result.baz.doe deserialized')
      console.log(result)
    }
  })
})

test('delete', t=> {
  t.plan(2)
  testapp.hashids.delete({
    id: 'fake'
  },
  function _delete(err) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'deleted')
      testapp.hashids.get({
        id: 'fake'
      },
      function _get(err, result) {
        if (err) {
          t.fail(err)
        }
        else {
          t.ok(typeof result === 'undefined', 'got undefined result')
          console.log(result)
        }
      })
    }
  })
})

test('query', t=> {
  t.plan(3)
  parallel([
    function _one(callback) {
      testapp.hashids.put({id: 'one'}, callback)
    },
    function _two(callback) {
      testapp.hashids.put({id: 'two'}, callback)
    },
    function _three(callback) {
      testapp.hashids.put({id: 'three'}, callback)
    },
  ],
  function _done(err, items) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(items, 'got items')
      testapp.hashids.query({
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': 'one',
        }
      },
      function _query(err, result) {
        if (err) {
          t.fail(err)
          console.log(err)
        }
        else {
          t.ok(result, 'got a result')
          t.ok(result.Count === 1, 'got one')
          console.log(result)
        }
      })
    }
  })
})

test('scan', t=> {
  t.plan(1)
  testapp.hashids.scan({
    FilterExpression : 'id = :id',
    ExpressionAttributeValues : {
      ':id' : 'two'
    }
  },
  function _scan(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'got a result')
      console.log(result)
    }
  })
})

test('update', t=> {
  t.plan(3)
  testapp.hashids.update({
    Key: {
      id: 'three'
    },
    UpdateExpression: 'set #hits = :hits',
    ExpressionAttributeNames: {
      '#hits' : 'hits'
    },
    ExpressionAttributeValues: {
      ':hits' : 20,
    }
  },
  function _update(err) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(true, 'updated without error')
      testapp.hashids.get({
        id: 'three'
      },
      function _get(err, result) {
        if (err) {
          t.fail(err)
          console.log(err)
        }
        else {
          t.ok(result, 'got result')
          t.ok(result.hits === 20, '20 hits')
          console.log(result)
        }
      })
    }
  })
})

test('server closes', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'closed')
})
