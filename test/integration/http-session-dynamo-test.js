let sandbox = require('@architect/sandbox')
const { test } = require('node:test')
const assert = require('node:assert')
let { join } = require('path')
let tiny = require('tiny-json-http')

let port = process.env.PORT ? process.env.PORT : '3333'
let url = s => `http://localhost:${port}${s ? s : ''}`

async function getSession (url) {
  let headers = { cookie }
  let result = await tiny.get({ url, headers })
  return JSON.parse(result.body)
}

function checkKeys (session) {
  let { _idx, _secret, _ttl } = session
  if (!_idx || !_secret || !_ttl) assert.fail(`Did not get back all internal session keys: ${JSON.stringify(session, null, 2)}`)
  else assert.ok(true, 'Got back internal session keys: _idx, _secret, _ttl')
}

let cookie // Assigned at setup
let mock = join(__dirname, '..', 'mock', 'project')

test('Set up env to test physical table name', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'test-only-staging-arc-sessions' // Use logical, not physical name
  let result = await sandbox.start({ quiet: true, cwd: mock })
  assert.strictEqual(result, 'Sandbox successfully started', result)
})

test('Create an initial session', async () => {
  let dest = url('/http-session')
  let result = await tiny.get({ url: dest })
  cookie = result.headers['set-cookie'][0]
  assert.ok(cookie, `Got cookie to use in sessions: ${cookie.substr(0, 50)}...`)
})

test('Teardown', async () => {
  delete process.env.ARC_SESSION_TABLE_NAME
  let result = await sandbox.end()
  assert.strictEqual(result, 'Sandbox successfully shut down', result)
})

test('Set up env to test logical table name', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'arc-sessions' // Use logical, not physical name
  let result = await sandbox.start({ quiet: true, cwd: mock })
  assert.strictEqual(result, 'Sandbox successfully started', result)
})

test('Create an initial session', async () => {
  let dest = url('/http-session')
  let result = await tiny.get({ url: dest })
  cookie = result.headers['set-cookie'][0]
  assert.ok(cookie, `Got cookie to use in sessions: ${cookie.substr(0, 50)}...`)
})

test('Do session stuff (continuation passing)', async () => {
  let session

  // Unpopulated session
  session = await getSession(url('/http-session'))
  assert.strictEqual(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session)

  // Add a data point
  session = await getSession(url('/http-session?session=create'))
  assert.strictEqual(Object.keys(session).length, 4, 'Got back a populated session')
  let unique = session.unique
  assert.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session)

  // Persist it across requests
  session = await getSession(url('/http-session'))
  assert.strictEqual(Object.keys(session).length, 4, 'Got back a populated session')
  assert.strictEqual(session.unique, unique, `Unique data point persisted in session across requests`)
  checkKeys(session)

  // Update the session
  session = await getSession(url('/http-session?session=update'))
  assert.strictEqual(Object.keys(session).length, 5, 'Got back a populated session')
  assert.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session)

  // Destroy the session
  session = await getSession(url('/http-session?session=destroy'))
  assert.deepStrictEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-session'))
  assert.strictEqual(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session)
})

test('Do session stuff (async)', async () => {
  let session

  // Unpopulated session
  session = await getSession(url('/http-async-session'))
  assert.strictEqual(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session)

  // Add a data point
  session = await getSession(url('/http-async-session?session=create'))
  assert.strictEqual(Object.keys(session).length, 4, 'Got back a populated session')
  let unique = session.unique
  assert.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session)

  // Persist it across requests
  session = await getSession(url('/http-async-session'))
  assert.strictEqual(Object.keys(session).length, 4, 'Got back a populated session')
  assert.strictEqual(session.unique, unique, `Unique data point persisted in session across requests`)
  checkKeys(session)

  // Update the session
  session = await getSession(url('/http-async-session?session=update'))
  assert.strictEqual(Object.keys(session).length, 5, 'Got back a populated session')
  assert.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session)

  // Destroy the session
  session = await getSession(url('/http-async-session?session=destroy'))
  assert.deepStrictEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-async-session'))
  assert.strictEqual(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session)
})

test('Teardown', async () => {
  delete process.env.ARC_SESSION_TABLE_NAME
  let result = await sandbox.end()
  assert.strictEqual(result, 'Sandbox successfully shut down', result)
})
