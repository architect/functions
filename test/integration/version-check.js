const sandbox = require('@architect/sandbox')
const test = require('tape')
const { join } = require('node:path')
const tiny = require('tiny-json-http')

const port = process.env.PORT ? process.env.PORT : '3333'
const url = (s) => `http://localhost:${port}${s ? s : ''}`
const cwd = process.cwd()
const mock = join(cwd, 'test', 'mock', 'project')

test('Set up env', async (t) => {
  t.plan(1)
  const result = await sandbox.start({ quiet: true, cwd: mock })
  t.equal(result, 'Sandbox successfully started', result)
})

test('Check for incompatible versions', async (t) => {
  t.plan(1)
  const dest = url('/incompatible-version')
  try {
    const result = await tiny.get({ url: dest })
    t.fail('Should not have responded with 2xx')
    console.log(result.body)
  } catch (err) {
    t.match(err.body, /Incompatible version: please upgrade/, 'Got incompatible version error')
  }
})

test('Teardown', async (t) => {
  t.plan(1)
  const result = await sandbox.end()
  t.equal(result, 'Sandbox successfully shut down', result)
})
