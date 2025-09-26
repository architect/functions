let sandbox = require('@architect/sandbox')
let { execSync: exec } = require('child_process')
const { test } = require('node:test')
const assert = require('node:assert')
let { join } = require('path')
let { copyFileSync, existsSync: exists, mkdirSync: mkdir  } = require('fs')

let arc
let data

let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')

test('Set up mocked files', () => {
  process.env.ARC_APP_NAME = 'test-app-name'
  mkdir(shared, { recursive: true })
  copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  copyFileSync(join(mock, 'mock-static'), join(shared, 'static.json'))
  assert.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  assert.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  assert.ok(exists(join(shared, 'static.json')), 'Mock static.json file ready')

  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('starts the db server', (t, done) => {
  sandbox.start({ quiet: true, cwd: tmp }, err => {
    if (err) assert.fail(err)
    else {
      assert.ok(true, 'Sandbox started')
      done()
    }
  })
})

test('tables() returns table object', async () => {
  data = await arc.tables()
  assert.ok(data.accounts, 'accounts table object exists')
  assert.ok(data.messages, 'messages table object exists')
  assert.ok(data['accounts-messages'], 'accounts-messages table object exists')
})

test('tables().name() returns the table\'s name', async () => {
  const { name } = await arc.tables()
  assert.strictEqual(name('accounts'), 'test-app-name-staging-accounts', 'accounts table returns correct logical id')
  assert.strictEqual(name('messages'), 'test-app-name-staging-messages', 'messages table returns correct logical id')
  assert.strictEqual(name('accounts-messages'), 'test-app-name-staging-accounts-messages')
})

test('tables().reflect() returns the table map', async () => {
  const { reflect } = await arc.tables()
  const tables = await reflect()
  assert.deepStrictEqual(tables, {
    accounts: 'test-app-name-staging-accounts',
    messages: 'test-app-name-staging-messages',
    'accounts-messages': 'test-app-name-staging-accounts-messages',
  }, 'map of table names to table logical ids should be correct')
})

test('tables put()', async () => {
  let item = await data.accounts.put({
    accountID: 'fake',
    foo: 'bar',
    baz: {
      one: 1,
      doe: true,
    },
  })
  assert.ok(item, 'returned item')
  item = null
  item = await data['accounts-messages'].put({
    accountID: 'fake',
    msgID: 'alsofake',
    extra: true,
  })
  assert.ok(item, `returned item`)
})

test('tables get()', async () => {
  let result = await data.accounts.get({
    accountID: 'fake',
  })
  assert.ok(result, 'got accounts table result')
  assert.ok(result.baz.doe, 'result.baz.doe deserialized')
  result = null
  result = await data['accounts-messages'].get({
    accountID: 'fake',
    msgID: 'alsofake',
  })
  assert.ok(result, 'got accounts-messages table result')
  assert.ok(result.extra, 'result.extra deserialized')
})

test('tables delete()', async () => {
  await data.accounts.delete({
    accountID: 'fake',
  })
  assert.ok(true, 'deleted')
  let result = await data.accounts.get({
    accountID: 'fake',
  })
  assert.strictEqual(result, undefined, 'could not get deleted accounts item')
  await data['accounts-messages'].delete({
    accountID: 'fake',
    msgID: 'alsofake',
  })
  assert.ok(true, 'deleted')
  let otherResult = await data['accounts-messages'].get({
    accountID: 'fake',
    msgID: 'alsofake',
  })
  assert.strictEqual(otherResult, undefined, 'could not get deleted accounts-messages item')
})

test('tables query()', async () => {
  let items = await Promise.all([
    data.accounts.put({ accountID: 'one' }),
    data.accounts.put({ accountID: 'two' }),
    data.accounts.put({ accountID: 'three' }),
  ])

  assert.ok(items, 'got items')

  let result = await data.accounts.query({
    KeyConditionExpression: 'accountID = :id',
    ExpressionAttributeValues: {
      ':id': 'one',
    },
  })

  assert.ok(result, 'got a result')
  assert.strictEqual(result.Count, 1, 'got count of one')
})

test('tables scan()', async () => {
  let result = await data.accounts.scan({
    FilterExpression: 'accountID = :id',
    ExpressionAttributeValues: {
      ':id': 'two',
    },
  })
  assert.ok(result, 'got a result')
})

test('tables scanAll()', async () => {
  let result = await data.accounts.scanAll({ Limit: 1 })
  assert.ok(result, 'got a result')
  assert.strictEqual(result.length, 3, 'Got back all rows')
})

test('tables update()', async () => {
  await data.accounts.update({
    Key: {
      accountID: 'three',
    },
    UpdateExpression: 'set #hits = :hits',
    ExpressionAttributeNames: {
      '#hits': 'hits',
    },
    ExpressionAttributeValues: {
      ':hits': 20,
    },
  })

  assert.ok(true, 'updated without error')

  let result = await data.accounts.get({
    accountID: 'three',
  })

  assert.ok(result, 'got result')
  assert.strictEqual(result.hits, 20, 'property updated')
})

test('server closes', (t, done) => {
  sandbox.end(err => {
    if (err) assert.fail(err)
    else {
      assert.ok(true, 'Sandbox ended')
      done()
    }
  })
})

test('Clean up env', () => {
  delete process.env.ARC_APP_NAME
  delete process.env.ARC_ENV
  exec(`rm -rf ${tmp}`)
  assert.ok(!exists(tmp), 'Mocks cleaned up')
})
