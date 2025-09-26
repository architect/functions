let sandbox = require('@architect/sandbox')
const { test } = require('node:test')
const assert = require('node:assert')
let { join } = require('path')
let tiny = require('tiny-json-http')

let port = process.env.PORT ? process.env.PORT : '3333'
let url = s => `http://localhost:${port}${s ? s : ''}`
let mock = join(__dirname, '..', 'mock', 'project')
let compress = {
  'accept-encoding': 'br',
}
let css = `/* css here! */\n`
let js = `/* js here! */\n`

test('Set up env', async () => {
  let result = await sandbox.start({ quiet: true, cwd: mock })
  assert.strictEqual(result, 'Sandbox successfully started', result)
})

test('Get uncompressed assets', async () => {
  let result

  // No compression
  result = await tiny.get({ url: url('/style.css') })
  assert.strictEqual(result.body, css, 'Got back correct CSS')

  result = await tiny.get({ url: url('/index.js') })
  assert.strictEqual(result.body, js, 'Got back correct JS')

  // Client accepts Brotli compression
  result = await tiny.get({ url: url('/style.css'), headers: compress })
  assert.strictEqual(result.body, css, 'Got back correct CSS')

  result = await tiny.get({ url: url('/index.js'), headers: compress })
  assert.strictEqual(result.body, js, 'Got back correct JS')
})

// TODO could probably stand to do a compressed test set, but that would require building local compression support for ASAP, which we did not yet bother with

test('Teardown', async () => {
  let result = await sandbox.end()
  assert.strictEqual(result, 'Sandbox successfully shut down', result)
})
