const { join } = require('node:path')
const test = require('tape')
const sandbox = require('@architect/sandbox')
const cwd = process.cwd()
const mock = join(cwd, 'test', 'mock', 'project')
const discovery = require('../../src/discovery')

test('Set up env', async (t) => {
  t.plan(1)
  await sandbox.start({ cwd: mock, quiet: true })
  t.pass('Sandbox started')
})

test('discovery should parse hierarchical SSM parameters into a service map object', (t) => {
  t.plan(6)
  discovery((err, services) => {
    t.notOk(err, 'No error passed to callback')
    t.equal(
      services.tables['arc-sessions'],
      'test-only-staging-arc-sessions',
      'Table value set up in correct place of service map',
    )
    t.equal(services.tables.things, 'test-only-staging-things', 'Table value set up in correct place of service map')

    // Check deeper depths
    t.ok(services.services.cloudwatch.metrics, 'Deeply nested object exists')
    t.equal(services.services.cloudwatch.metrics.foo, 'bar', 'variable has correct value')
    t.ok(services.services.cloudwatch.metrics.fiz, 'buz', 'variable has correct value')
  })
})

test('Teardown', async (t) => {
  t.plan(1)
  await sandbox.end()
  t.pass('Sandbox ended')
})
