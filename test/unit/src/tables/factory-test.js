const { join } = require('node:path')
const test = require('tape')
const proxyquire = require('proxyquire')
const sandbox = require('@architect/sandbox')
const cwd = process.cwd()
const mock = join(cwd, 'test', 'mock', 'project')

const noop = () => {}
const factory = proxyquire('../../../../src/tables/factory', {
  './legacy': () => ({ db: noop, doc: noop }),
})

const services = { tables: { hi: 'there' } }

test('Set up env', async (t) => {
  t.plan(2)
  await sandbox.start({ cwd: mock, quiet: true })
  t.pass('Sandbox started')
  t.ok(factory, 'Tables factory ready')
})

test('tables.factory main client', (t) => {
  t.plan(4)
  factory({ services }, (err, client) => {
    if (err) t.fail(err)
    t.ok(client._client, '_client property assigned')
    t.notOk(client._db, '_db property not assigned')
    t.notOk(client._doc, '_doc property not assigned')
    t.ok(client.hi, 'table name assigned')
  })
})

test('tables.factory AWS SDK properties', (t) => {
  t.plan(4)
  factory({ services, options: { awsSdkClient: true } }, (err, client) => {
    if (err) t.fail(err)
    t.ok(client._client, '_client property assigned')
    t.ok(client._db, '_db property assigned')
    t.ok(client._doc, '_doc property assigned')
    t.ok(client.hi, 'table name assigned')
  })
})

test('tables.factory client static methods', (t) => {
  t.plan(2)
  const services = { tables: { quart: 'tequila' } }
  factory({ services }, async (err, client) => {
    if (err) t.fail(err)
    t.equals(await client.reflect(), services.tables, 'reflect() returns tables object')
    t.equals(client._name('quart'), 'tequila', '_name() returns tables value')
  })
})

test('Teardown', async (t) => {
  t.plan(1)
  delete process.env.ARC_ENV
  await sandbox.end()
  t.pass('Sandbox ended')
})
