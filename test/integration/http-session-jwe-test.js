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
  let newCookie = result.headers['set-cookie'][0]
  cookie = newCookie
  return JSON.parse(result.body)
}

function checkKeys (session) {
  let { iat } = session
  if (!iat) assert.fail(`Did not get back all internal session keys: ${JSON.stringify(session, null, 2)}`)
  else assert.ok(true, 'Got back internal session key: iat')
}

let cookie // Assigned at setup
let mock = join(__dirname, '..', 'mock', 'project')

test('Set up env', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'
  let result = await sandbox.start({ quiet: true, cwd: mock })
  assert.strictEqual(result, 'Sandbox successfully started', result)
})

test('Create an initial session', async () => {
  let result = await tiny.get({ url: url('/http-session') })
  cookie = result.headers['set-cookie'][0]
  assert.ok(cookie, `Got cookie to use in sessions: ${cookie.substr(0, 50)}...`)
})

test('Do session stuff (continuation passing)', async () => {
  let session

  // Unpopulated session
  session = await getSession(url('/http-session'))
  assert.strictEqual(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session)

  // Add a data point
  session = await getSession(url('/http-session?session=create'))
  assert.strictEqual(Object.keys(session).length, 2, 'Got back a populated session')
  let unique = session.unique
  assert.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session)

  // Persist it across requests
  session = await getSession(url('/http-session'))
  assert.strictEqual(Object.keys(session).length, 2, 'Got back a populated session')
  assert.strictEqual(session.unique, unique, `Unique data point persisted in session across requests`)
  checkKeys(session)

  // Update the session
  session = await getSession(url('/http-session?session=update'))
  assert.strictEqual(Object.keys(session).length, 3, 'Got back a populated session')
  assert.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session)

  // Destroy the session
  session = await getSession(url('/http-session?session=destroy'))
  assert.deepStrictEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-session'))
  assert.strictEqual(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session)
})

test('Do session stuff (async)', async () => {
  let session

  // Unpopulated session
  session = await getSession(url('/http-async-session'))
  assert.strictEqual(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session)

  // Add a data point
  session = await getSession(url('/http-async-session?session=create'))
  assert.strictEqual(Object.keys(session).length, 2, 'Got back a populated session')
  let unique = session.unique
  assert.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session)

  // Persist it across requests
  session = await getSession(url('/http-async-session'))
  assert.strictEqual(Object.keys(session).length, 2, 'Got back a populated session')
  assert.strictEqual(session.unique, unique, `Unique data point persisted in session across requests`)
  checkKeys(session)

  // Update the session
  session = await getSession(url('/http-async-session?session=update'))
  assert.strictEqual(Object.keys(session).length, 3, 'Got back a populated session')
  assert.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session)

  // Destroy the session
  session = await getSession(url('/http-async-session?session=destroy'))
  assert.deepStrictEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-async-session'))
  assert.strictEqual(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session)
})

test('Teardown', async () => {
  delete process.env.ARC_SESSION_TABLE_NAME
  let result = await sandbox.end()
  assert.strictEqual(result, 'Sandbox successfully shut down', result)
})
