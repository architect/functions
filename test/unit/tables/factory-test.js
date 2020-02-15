let sandbox = require('@architect/sandbox')
let test = require('tape')
let path = require('path')
let arc = require('../../../')
let end
let cwd = process.cwd()

test('Start sandbox', async t => {
  t.plan(1)
  process.chdir(path.join(__dirname, '..', '..', 'mock'))
  end = await sandbox.start({quiet: true})
  t.ok(end, 'Sandbox started')
})

test('reflect', async t => {
  t.plan(1)

  let result = await arc.tables()
  t.ok(result, 'result')
  console.log(result)
  //let result2 = await client.data.scan({})
  //t.ok(result2, 'result2')
  //console.log(result2)
})

test('Close sandbox', async t => {
  t.plan(1)
  await end()
  // Hacky: Sandbox should really be cleaning up after its own env vars
  delete process.env.NODE_ENV
  delete process.env.ARC_HTTP
  delete process.env.SESSION_TABLE_NAME
  delete process.env.ARC_STATIC_BUCKET
  delete process.env.ARC_WSS_URL
  t.ok(true, 'Sandbox closed')
  process.chdir(cwd)
})
