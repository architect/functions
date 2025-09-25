let sandbox = require('@architect/sandbox')
let test = require('tape')
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

test('Set up env', async t => {
  t.plan(1)
  let result = await sandbox.start({ quiet: true, cwd: mock })
  t.equal(result, 'Sandbox successfully started', result)
})

test('Get uncompressed assets', async t => {
  t.plan(4)
  let result

  // No compression
  result = await tiny.get({ url: url('/style.css') })
  t.equal(result.body, css, 'Got back correct CSS')

  result = await tiny.get({ url: url('/index.js') })
  t.equal(result.body, js, 'Got back correct JS')

  // Client accepts Brotli compression
  result = await tiny.get({ url: url('/style.css'), headers: compress })
  t.equal(result.body, css, 'Got back correct CSS')

  result = await tiny.get({ url: url('/index.js'), headers: compress })
  t.equal(result.body, js, 'Got back correct JS')
})

// TODO could probably stand to do a compressed test set, but that would require building local compression support for ASAP, which we did not yet bother with

test('Teardown', async t => {
  t.plan(1)
  let result = await sandbox.end()
  t.equal(result, 'Sandbox successfully shut down', result)
})
