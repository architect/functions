let { join } = require('path')
let test = require('tape')
let proxyquire = require('proxyquire')
let sandbox = require('@architect/sandbox')
let cwd = process.cwd()
let mock = join(cwd, 'test', 'mock', 'project')

let noop = () => {}
let factory = proxyquire('../../../../src/tables/factory', {
  './legacy': () => ({ db: noop, doc: noop }),
})

let services = { tables: { hi: 'there' } }

test('Set up env', async t => {
  t.plan(2)
  await sandbox.start({ cwd: mock, quiet: true })
  t.pass('Sandbox started')
  t.ok(factory, 'Tables factory ready')
})


test('tables.factory main client', t => {
  t.plan(4)
  factory({ services }, (err, client) => {
    if (err) t.fail(err)
    t.ok(client._client, '_client property assigned')
    t.notOk(client._db, '_db property not assigned')
    t.notOk(client._doc, '_doc property not assigned')
    t.ok(client.hi, 'table name assigned')
  })
})

test('tables.factory AWS SDK properties', t => {
  t.plan(4)
  factory({ services, options: { awsSdkClient: true } }, (err, client) => {
    if (err) t.fail(err)
    t.ok(client._client, '_client property assigned')
    t.ok(client._db, '_db property assigned')
    t.ok(client._doc, '_doc property assigned')
    t.ok(client.hi, 'table name assigned')
  })
})

test('tables.factory client static methods', t => {
  t.plan(2)
  let services = { tables: { quart: 'tequila' } }
  factory({ services }, async (err, client) => {
    if (err) t.fail(err)
    t.equals(await client.reflect(), services.tables, 'reflect() returns tables object')
    t.equals(client._name('quart'), 'tequila', '_name() returns tables value')
  })
})

test('Teardown', async t => {
  t.plan(1)
  delete process.env.ARC_ENV
  await sandbox.end()
  t.pass('Sandbox ended')
})
