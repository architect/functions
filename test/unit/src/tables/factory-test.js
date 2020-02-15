//let path = require('path')
let test = require('tape')
//let sandbox = require('@architect/sandbox')
let factory = require('../../../../src/tables/factory')

test('env', t => {
  t.plan(1)
  t.ok(factory, 'factory')
})

let client

test('factory', t => {
  t.plan(9)
  factory({
    data: 'testapp-staging-data'
  },
  function done(err, c) {
    client = c
    t.ok(client.data, 'data')
    t.ok(client.data.delete, 'delete')
    t.ok(client.data.get, 'get')
    t.ok(client.data.put, 'put')
    t.ok(client.data.query, 'query')
    t.ok(client.data.scan, 'scan')
    t.ok(client.data.update, 'update')
    t.ok(client.reflect, 'reflect')
    t.ok(client._name, '_name')
    console.log(err, client)
  })
})

/*
let end

test('db.start', async t => {
  t.plan(1)
  process.chdir(path.join(__dirname, '..', '..', '..', 'mock'))
  end = await sandbox.start()
  t.ok(true, 'ended')
})

test('reflect and scan', async t => {
  t.plan(2)
  let result = await client.reflect()
  t.ok(result, 'result')
  console.log(result)
  let result2 = await client.data.scan({})
  t.ok(result2, 'result2')
  console.log(result2)
})

test('db.end', async t => {
  t.plan(1)
  await end()
  t.ok(true, 'ended')
})*/
