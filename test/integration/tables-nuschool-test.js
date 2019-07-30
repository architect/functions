let sandbox = require('@architect/sandbox')
let exec = require('child_process').execSync
let test = require('tape')
let mkdir = require('mkdirp').sync
let exists = require('path-exists').sync
let join = require('path').join
let fs = require('fs')

let arc
let server
let data

let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')

let origCwd = process.cwd()

test('Set up mocked files', t=> {
  t.plan(2)
  mkdir(shared)
  fs.copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  fs.copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  fs.copyFileSync(join(mock, 'mock-static'), join(shared, 'static.json'))
  t.ok(exists(join(shared, '.arc')), 'Mock .arc file ready')
  t.ok(exists(join(shared, 'static.json')), 'Mock static.json file ready')
  process.chdir(tmp)
  // eslint-disable-next-line
  arc = require('../..') // module globally inspects arc file so need to require after chdir
})
test('starts the db server', t=> {
  t.plan(1)
  server = sandbox.db.start(function _start() {
    t.ok(true, 'started db server')
  })
})

test('tables() returns table object', async t => {
  t.plan(2)
  data = await arc.tables()
  t.ok(data.accounts, 'accounts table object exists')
  t.ok(data.messages, 'messages table object exists')
})

test('tables put()', async t=>{
  t.plan(1)
  let item = await data.accounts.put({
    accountID: 'fake',
    foo: 'bar',
    baz: {
      one: 1,
      doe: true
    }
  })
  t.ok(item, 'returned item')
})

test('tables get()', async t=> {
  t.plan(2)
  let result = await data.accounts.get({
    accountID: 'fake'
  })
  t.ok(result, 'got result')
  t.ok(result.baz.doe, 'result.baz.doe deserialized')
})

test('tables delete()', async t=> {
  t.plan(2)
  await data.accounts.delete({
    accountID: 'fake'
  })
  t.ok(true, 'deleted')
  let result = await data.accounts.get({
    accountID: 'fake'
  })
  t.equals(result, undefined, 'got undefined result')
})

test('tables query()', async t=> {
  t.plan(3)
  let items = await Promise.all([
    data.accounts.put({accountID: 'one'}),
    data.accounts.put({accountID: 'two'}),
    data.accounts.put({accountID: 'three'}),
  ])

  t.ok(items, 'got items')

  let result = await data.accounts.query({
    KeyConditionExpression: 'accountID = :id',
    ExpressionAttributeValues: {
      ':id': 'one',
    }
  })

  t.ok(result, 'got a result')
  t.equals(result.Count, 1, 'got count of one')
})

test('tables scan()', async t=> {
  t.plan(1)
  let result = await data.accounts.scan({
    FilterExpression : 'accountID = :id',
    ExpressionAttributeValues : {
      ':id' : 'two'
    }
  })
  t.ok(result, 'got a result')
})

test('tables update()', async t=> {
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
  t.equals(result.hits, 20, 'property updated')
})

test('server closes', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'closed')
})

test('Clean up env', t=> {
  t.plan(1)
  process.env.NODE_ENV = 'testing'
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
