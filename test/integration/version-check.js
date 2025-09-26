let sandbox = require('@architect/sandbox')
const { test } = require('node:test')
const assert = require('node:assert')
let { join } = require('path')
let tiny = require('tiny-json-http')

let port = process.env.PORT ? process.env.PORT : '3333'
let url = s => `http://localhost:${port}${s ? s : ''}`
let cwd = process.cwd()
let mock = join(cwd, 'test', 'mock', 'project')

test('Set up env', async () => {
  let result = await sandbox.start({ quiet: true, cwd: mock })
  assert.strictEqual(result, 'Sandbox successfully started', result)
})

test('Check for incompatible versions', async () => {
  let dest = url('/incompatible-version')
  try {
    let result = await tiny.get({ url: dest })
    assert.fail('Should not have responded with 2xx')
    console.log(result.body)
  }
  catch (err) {
    assert.match(err.body, /Incompatible version: please upgrade/, 'Got incompatible version error')
  }
})

test('Teardown', async () => {
  let result = await sandbox.end()
  assert.strictEqual(result, 'Sandbox successfully shut down', result)
})
