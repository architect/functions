let sandbox = require('@architect/sandbox')
let test = require('tape')
let { join } = require('path')
let tiny = require('tiny-json-http')

let port = process.env.PORT ? process.env.PORT : '3333'
let url = s => `http://localhost:${port}${s ? s : ''}`

async function getSession (url) {
  let headers = { cookie }
  let result = await tiny.get({ url, headers })
  return JSON.parse(result.body)
}

function checkKeys (session, t) {
  let { _idx, _secret, _ttl } = session
  if (!_idx || !_secret || !_ttl) t.fail(`Did not get back all internal session keys: ${JSON.stringify(session, null, 2)}`)
  else t.pass('Got back internal session keys: _idx, _secret, _ttl')
}

let cookie // Assigned at setup
let mock = join(__dirname, '..', 'mock', 'project')

test('Set up env', async t => {
  t.plan(1)
  process.env.SESSION_TABLE_NAME = 'test-only-staging-arc-sessions'
  let result = await sandbox.start({ quiet: true, cwd: mock })
  t.equal(result, 'Sandbox successfully started', result)
})

test('Create an initial session', async t => {
  t.plan(1)
  let dest = url('/http-session')
  let result = await tiny.get({ url: dest })
  cookie = result.headers['set-cookie'][0]
  t.ok(cookie, `Got cookie to use in sessions: ${cookie.substr(0, 50)}...`)
})

test('Do session stuff (arc.http)', async t => {
  t.plan(14)
  let session

  // Unpopulated session
  session = await getSession(url('/http-session'))
  t.equal(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session, t)

  // Add a data point
  session = await getSession(url('/http-session?session=create'))
  t.equal(Object.keys(session).length, 4, 'Got back a populated session')
  let unique = session.unique
  t.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session, t)

  // Persist it across requests
  session = await getSession(url('/http-session'))
  t.equal(Object.keys(session).length, 4, 'Got back a populated session')
  t.equal(session.unique, unique, `Unique data point persisted in session across requests`)
  checkKeys(session, t)

  // Update the session
  session = await getSession(url('/http-session?session=update'))
  t.equal(Object.keys(session).length, 5, 'Got back a populated session')
  t.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session, t)

  // Destroy the session
  session = await getSession(url('/http-session?session=destroy'))
  t.deepEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-session'))
  t.equal(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session, t)
})

test('Do session stuff (arc.http.async)', async t => {
  t.plan(14)
  let session

  // Unpopulated session
  session = await getSession(url('/http-async-session'))
  t.equal(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session, t)

  // Add a data point
  session = await getSession(url('/http-async-session?session=create'))
  t.equal(Object.keys(session).length, 4, 'Got back a populated session')
  let unique = session.unique
  t.ok(unique, `Got a unique data point created from session, ${unique}`)
  checkKeys(session, t)

  // Persist it across requests
  session = await getSession(url('/http-async-session'))
  t.equal(Object.keys(session).length, 4, 'Got back a populated session')
  t.equal(session.unique, unique, `Unique data point persisted in session across requests`)
  checkKeys(session, t)

  // Update the session
  session = await getSession(url('/http-async-session?session=update'))
  t.equal(Object.keys(session).length, 5, 'Got back a populated session')
  t.ok(session.another, `Got an updated data data point from session, ${session.another}`)
  checkKeys(session, t)

  // Destroy the session
  session = await getSession(url('/http-async-session?session=destroy'))
  t.deepEqual(session, {}, 'Session destroyed')

  // Unpopulated session again!
  session = await getSession(url('/http-async-session'))
  t.equal(Object.keys(session).length, 3, 'Got back an unpopulated session')
  checkKeys(session, t)
})

test('Teardown', async t => {
  t.plan(1)
  delete process.env.SESSION_TABLE_NAME
  let result = await sandbox.end()
  t.equal(result, 'Sandbox successfully shut down', result)
})
