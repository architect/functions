let sandbox = require('@architect/sandbox')
let test = require('tape')
let path = require('path')
let arc = require('../../../')
let end
let cwd = process.cwd()

test('start', async t => {
  t.plan(1)
  process.chdir(path.join(__dirname, '..', '..', 'mock'))
  end = await sandbox.start()
  t.ok(true, 'ended')
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

test('db.end', async t => {
  t.plan(1)
  await end()
  t.ok(true, 'ended')
  process.chdir(cwd)
})
