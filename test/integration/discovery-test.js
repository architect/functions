let { join } = require('path')
const { test } = require('node:test')
const assert = require('node:assert')
let sandbox = require('@architect/sandbox')
let cwd = process.cwd()
let mock = join(cwd, 'test', 'mock', 'project')
let discovery = require('../../src/discovery')

test('Set up env', async () => {
  await sandbox.start({ cwd: mock, quiet: true })
})

test('discovery should parse hierarchical SSM parameters into a service map object', (t, done) => {
  discovery((err, services) => {
    assert.ok(!err, 'No error passed to callback')
    assert.strictEqual(services.tables['arc-sessions'], 'test-only-staging-arc-sessions', 'Table value set up in correct place of service map')
    assert.strictEqual(services.tables.things, 'test-only-staging-things', 'Table value set up in correct place of service map')

    // Check deeper depths
    assert.ok(services.services.cloudwatch.metrics, 'Deeply nested object exists')
    assert.strictEqual(services.services.cloudwatch.metrics.foo, 'bar', 'variable has correct value')
    assert.strictEqual(services.services.cloudwatch.metrics.fiz, 'buz', 'variable has correct value')
    done()
  })
})

test('Teardown', async () => {
  await sandbox.end()
})
