let sandbox = require('@architect/sandbox')
let { execSync: exec } = require('child_process')
let test = require('tape')
let { join } = require('path')
let { copyFileSync, existsSync: exists, mkdirSync: mkdir  } = require('fs')

let arc
let data

let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')


test('Set up mocked files', t => {
  t.plan(3)
  process.env.ARC_APP_NAME = 'test'
  mkdir(shared, { recursive: true })
  copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  copyFileSync(join(mock, 'mock-static'), join(shared, 'static.json'))
  t.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  t.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  t.ok(exists(join(shared, 'static.json')), 'Mock static.json file ready')
  // eslint-disable-next-line
  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('starts the db server', t => {
  t.plan(1)
  sandbox.start({ quiet: false, cwd: tmp }, err => {
    if (err) t.fail(err)
    else t.pass('Sandbox started')
  })
})

test('tables() returns table object', async t => {
  t.plan(3)
  data = await arc.tables()
  t.ok(data.accounts, 'accounts table object exists')
  t.ok(data.messages, 'messages table object exists')
  t.ok(data['accounts-messages'], 'accounts-messages table object exists')
})

test('tables().name() returns the table\'s name', async t => {
  t.plan(3)
  const { name } = await arc.tables()
  t.equal(name('accounts'), 'test-app-name-staging-accounts', 'accounts table returns correct logical id')
  t.equal(name('messages'), 'test-app-name-staging-messages', 'messages table returns correct logical id')
  t.equal(name('accounts-messages'), 'test-app-name-staging-accounts-messages')
})

test('tables().reflect() returns the table map', async t => {
  t.plan(1)
  const { reflect } = await arc.tables()
  const tables = await reflect()
  t.deepEqual(tables, {
    accounts: 'test-app-name-staging-accounts',
    messages: 'test-app-name-staging-messages',
    'accounts-messages': 'test-app-name-staging-accounts-messages',
  }, 'map of table names to table logical ids should be correct')
})

test('tables put()', async t => {
  t.plan(2)
  let item = await data.accounts.put({
    accountID: 'fake',
    foo: 'bar',
    baz: {
      one: 1,
      doe: true
    }
  })
  t.ok(item, 'returned item')
  item = null
  item = await data['accounts-messages'].put({
    accountID: 'fake',
    msgID: 'alsofake',
    extra: true
  })
  t.ok(item, `returned item`)
})

test('tables get()', async t => {
  t.plan(4)
  let result = await data.accounts.get({
    accountID: 'fake'
  })
  t.ok(result, 'got accounts table result')
  t.ok(result.baz.doe, 'result.baz.doe deserialized')
  result = null
  console.log(data['accounts-messages'].get)
  result = await data['accounts-messages'].get({
    accountID: 'fake',
    msgID: 'alsofake'
  })
  t.ok(result, 'got accounts-messages table result')
  t.ok(result.extra, 'result.extra deserialized')
})

test('tables delete()', async t => {
  t.plan(4)
  await data.accounts.delete({
    accountID: 'fake'
  })
  t.ok(true, 'deleted')
  let result = await data.accounts.get({
    accountID: 'fake'
  })
  t.equals(result, undefined, 'could not get deleted accounts item')
  await data['accounts-messages'].delete({
    accountID: 'fake',
    msgID: 'alsofake'
  })
  t.ok(true, 'deleted')
  let otherResult = await data['accounts-messages'].get({
    accountID: 'fake',
    msgID: 'alsofake'
  })
  t.equals(otherResult, undefined, 'could not get deleted accounts-messages item')
})

test('tables query()', async t => {
  t.plan(3)
  let items = await Promise.all([
    data.accounts.put({ accountID: 'one' }),
    data.accounts.put({ accountID: 'two' }),
    data.accounts.put({ accountID: 'three' }),
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

test('tables scan()', async t => {
  t.plan(1)
  let result = await data.accounts.scan({
    FilterExpression: 'accountID = :id',
    ExpressionAttributeValues: {
      ':id': 'two'
    }
  })
  t.ok(result, 'got a result')
})

test('tables update()', async t => {
  t.plan(3)
  await data.accounts.update({
    Key: {
      accountID: 'three'
    },
    UpdateExpression: 'set #hits = :hits',
    ExpressionAttributeNames: {
      '#hits': 'hits'
    },
    ExpressionAttributeValues: {
      ':hits': 20,
    }
  })

  t.ok(true, 'updated without error')

  let result = await data.accounts.get({
    accountID: 'three'
  })

  t.ok(result, 'got result')
  t.equals(result.hits, 20, 'property updated')
})

test('server closes', t => {
  t.plan(1)
  sandbox.end(err => {
    if (err) t.fail(err)
    else t.pass('Sandbox ended')
  })
})

test('Clean up env', t => {
  t.plan(1)
  delete process.env.ARC_APP_NAME
  delete process.env.ARC_ENV
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
