let arc
let server
let data
let exists = require('path-exists').sync
let fs = require('fs')
let join = require('path').join
let mkdir = require('mkdirp').sync
let test = require('tape')
let rmrf = require('rimraf')

let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')
let previousCwd = process.cwd()
let sandbox = require('@architect/sandbox')

test('Set up mocked arc project', t=> {
  t.plan(1)
  mkdir(shared)
  fs.copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  fs.copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  t.ok(exists(join(shared, '.arc')), 'Mock .arc file ready')
  process.chdir(tmp)
  // eslint-disable-next-line
  arc = require('../..') // require it here as global scope in static relies on cwd()
})

test('start the db server', t=> {
  t.plan(1)
  server = sandbox.db.start(function _start() {
    t.ok(true, 'started db server')
  })
})

test('tables() returns table objects as defined in .arc file', async t => {
  t.plan(2)
  data = await arc.tables()
  t.ok(data.accounts, 'data.accounts object exists')
  t.ok(data.messages, 'data.accounts object exists')
})

test('tables().put()', async t=>{
  t.plan(1)
  let item = await data.accounts.put({
    accountID: 'fake',
    name: 'batman'
  })
  t.ok(item, 'put() returned item')
})

test('tables().get()', async t=> {
  t.plan(2)
  let result = await data.accounts.get({
    accountID: 'fake'
  })
  t.ok(result, 'got result')
  t.equals(result.name, 'batman', 'result had expected property')
})

test('tables().delete()', async t=> {
  t.plan(1)
  await data.accounts.delete({
    accountID: 'fake'
  })
  let result = await data.accounts.get({
    accountID: 'fake'
  })
  t.equals(result, undefined, 'got undefined result when getting deleted item')
})

test('tables().query()', async t=> {
  t.plan(2)
  await Promise.all([
    data.accounts.put({accountID: 'one'}),
    data.accounts.put({accountID: 'two'}),
    data.accounts.put({accountID: 'three'}),
  ])

  let result = await data.accounts.query({
    KeyConditionExpression: 'accountID = :id',
    ExpressionAttributeValues: {
      ':id': 'one',
    }
  })

  t.ok(result, 'result is truthy')
  t.equals(result.Count, 1, 'result.Count is one')
})

test('tables().scan()', async t=> {
  t.plan(1)
  let result = await data.accounts.scan({
    FilterExpression : 'accountID = :id',
    ExpressionAttributeValues : {
      ':id' : 'two'
    }
  })
  t.ok(result, 'got a result')
})

test('tables().update()', async t=> {
  t.plan(3)
  await data.accounts.update({
    Key: {
      accountID: 'three'
    },
    UpdateExpression: 'set #hits = :hits',
    ExpressionAttributeNames: {
      '#hits' : 'hits'
    },
    ExpressionAttributeValues: {
      ':hits' : 20,
    }
  })

  t.ok(true, 'updated without error')

  let result = await data.accounts.get({
    accountID: 'three'
  })

  t.ok(result, 'got result')
  t.equals(result.hits, 20, 'retrieved property was correctly updated')
})

test('shut down the db server', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'closed')
})

test('Clean up env', t=> {
  t.plan(1)
  rmrf.sync(tmp)
  t.ok(!exists(tmp), 'Mocks cleaned up')
  process.chdir(previousCwd)
})
