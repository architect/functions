let sandbox = require('@architect/sandbox')
let test = require('tape')
let { join } = require('path')
let tiny = require('tiny-json-http')

let port = process.env.PORT ? process.env.PORT : '3333'
let url = s => `http://localhost:${port}${s ? s : ''}`
let cwd = process.cwd()
let mock = join(cwd, 'test', 'mock', 'project')

test('Set up env', async t => {
  t.plan(1)
  let result = await sandbox.start({ quiet: true, cwd: mock })
  t.equal(result, 'Sandbox successfully started', result)
})

test('Create an initial session', async t => {
  t.plan(1)
  let dest = url('/incompatible-version')
  try {
    let result = await tiny.get({ url: dest })
    t.fail('Should not have responded with 2xx')
    console.log(result.body)
  }
  catch (err) {
    t.match(err.body, /Incompatible version: please upgrade/, 'Got incompatible version error')
  }
})

test('Teardown', async t => {
  t.plan(1)
  let result = await sandbox.end()
  t.equal(result, 'Sandbox successfully shut down', result)
})
