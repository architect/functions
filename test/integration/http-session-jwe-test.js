const sandbox = require('@architect/sandbox')
const test = require('tape')
const { join } = require('node:path')
const tiny = require('tiny-json-http')

const port = process.env.PORT ? process.env.PORT : '3333'
const url = (s) => `http://localhost:${port}${s ? s : ''}`

async function getSession(url) {
  const headers = { cookie }
  const result = await tiny.get({ url, headers })
  const newCookie = result.headers['set-cookie'][0]
  cookie = newCookie
  return JSON.parse(result.body)
}

function checkKeys(session, t) {
  const { iat } = session
  if (!iat) t.fail(`Did not get back all internal session keys: ${JSON.stringify(session, null, 2)}`)
  else t.pass('Got back internal session key: iat')
}

let cookie // Assigned at setup
const mock = join(__dirname, '..', 'mock', 'project')

test('Set up env', async (t) => {
  t.plan(1)
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'
  const result = await sandbox.start({ quiet: true, cwd: mock })
  t.equal(result, 'Sandbox successfully started', result)
})

test('Create an initial session', async (t) => {
  t.plan(1)
  const result = await tiny.get({ url: url('/http-session') })
  cookie = result.headers['set-cookie'][0]
  t.ok(cookie, `Got cookie to use in sessions: ${cookie.substr(0, 50)}...`)
})

test('Do session stuff (continuation passing)', async (t) => {
  t.plan(14)
  let session

  // Unpopulated session
  session = await getSession(url('/http-session'))
  t.equal(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session, t)

  // Add a data point
  session = await getSession(url('/http-session?session=create'))
  t.equal(Object.keys(session).length, 2, 'Got back a populated session')
  const unique = session.unique
  t.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session, t)

  // Persist it across requests
  session = await getSession(url('/http-session'))
  t.equal(Object.keys(session).length, 2, 'Got back a populated session')
  t.equal(session.unique, unique, 'Unique data point persisted in session across requests')
  checkKeys(session, t)

  // Update the session
  session = await getSession(url('/http-session?session=update'))
  t.equal(Object.keys(session).length, 3, 'Got back a populated session')
  t.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session, t)

  // Destroy the session
  session = await getSession(url('/http-session?session=destroy'))
  t.deepEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-session'))
  t.equal(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session, t)
})

test('Do session stuff (async)', async (t) => {
  t.plan(14)
  let session

  // Unpopulated session
  session = await getSession(url('/http-async-session'))
  t.equal(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session, t)

  // Add a data point
  session = await getSession(url('/http-async-session?session=create'))
  t.equal(Object.keys(session).length, 2, 'Got back a populated session')
  const unique = session.unique
  t.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session, t)

  // Persist it across requests
  session = await getSession(url('/http-async-session'))
  t.equal(Object.keys(session).length, 2, 'Got back a populated session')
  t.equal(session.unique, unique, 'Unique data point persisted in session across requests')
  checkKeys(session, t)

  // Update the session
  session = await getSession(url('/http-async-session?session=update'))
  t.equal(Object.keys(session).length, 3, 'Got back a populated session')
  t.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session, t)

  // Destroy the session
  session = await getSession(url('/http-async-session?session=destroy'))
  t.deepEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-async-session'))
  t.equal(Object.keys(session).length, 1, 'Got back an unpopulated session')
  checkKeys(session, t)
})

test('Teardown', async (t) => {
  t.plan(1)
  delete process.env.ARC_SESSION_TABLE_NAME
  const result = await sandbox.end()
  t.equal(result, 'Sandbox successfully shut down', result)
})
