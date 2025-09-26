let { join } = require('path')
let sandbox = require('@architect/sandbox')
let { test } = require('node:test')
let assert = require('node:assert')
let http = require('../../../../../src/http')
let { read, write } = http.session

test('http.session apis exist', () => {
  assert.ok(read, 'http.session.read')
  assert.ok(write, 'http.session.write')
})

test('JWE read + write', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'
  process.env.ARC_SESSION_TTL = 14400
  let fakerequest = {}
  let session = await read(fakerequest)
  assert.ok(session, 'read session cookie')
  session.one = 1
  let cookie = await write(session)
  assert.ok(cookie, 'wrote session cookie')
  let inception = await read({ headers: { Cookie: cookie } })
  console.log({ session, cookie, inception })
  assert.strictEqual(inception.one, 1, 'read back again')
  // Lambda payload version 2
  let inception2 = await read({ cookies: [ cookie ] })
  assert.strictEqual(inception2.one, 1, 'read back again from payload version 2')
  assert.match(cookie, new RegExp(`Max-Age=${process.env.ARC_SESSION_TTL}`), 'cookie max-age is set correctly')
})

test('JWE configuration', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'
  process.env.ARC_SESSION_TTL = 14400
  let session = {}, cookie

  // Default
  process.env.ARC_ENV = 'testing'
  delete process.env.ARC_SESSION_SAME_SITE
  cookie = await write(session)
  assert.match(cookie, /SameSite=Lax/, 'SameSite is set correctly to default')
  assert.doesNotMatch(cookie, /Secure;/, 'Secure is not set')
  console.log(cookie)

  // Configure SameSite
  process.env.ARC_SESSION_SAME_SITE = 'None'
  cookie = await write(session)
  assert.match(cookie, new RegExp(`SameSite=${process.env.ARC_SESSION_SAME_SITE}`), 'SameSite is set correctly to configured value')
  console.log(cookie)

  // Configure Domain
  process.env.ARC_SESSION_DOMAIN = 'foo'
  cookie = await write(session)
  assert.match(cookie, new RegExp(`Domain=${process.env.ARC_SESSION_DOMAIN}`), 'Domain is set correctly to configured value')
  console.log(cookie)
  delete process.env.ARC_SESSION_DOMAIN
  process.env.SESSION_DOMAIN = 'bar'
  cookie = await write(session)
  assert.match(cookie, new RegExp(`Domain=${process.env.SESSION_DOMAIN}`), 'Domain is set correctly to configured value')
  console.log(cookie)

  // Configure secure
  process.env.ARC_ENV = 'staging'
  cookie = await write(session)
  assert.match(cookie, new RegExp(`Secure`), 'Secure is set')
  console.log(cookie)
  delete process.env.ARC_ENV
})

test('JWE algo / secret configuration', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'
  process.env.ARC_SESSION_TTL = 14400
  let payload = { one: 1 }
  let session, cookie

  // Default algo / secret
  cookie = await write(payload)
  assert.ok(cookie, `Wrote session cookie: ${cookie}`)
  session = await read({ headers: { cookie } })
  console.log(`Current session:`, session)
  assert.strictEqual(session.one, 1, 'Returned session using default algorithm and secret')

  // Default algo + custom secret
  process.env.ARC_APP_SECRET = 'abcdefghijklmnopqrstuvwxyz012345'
  session = await read({ headers: { cookie } })
  console.log(`Current session:`, session)
  assert.deepStrictEqual(session, {}, 'Returned empty session (because secret changed)')
  cookie = await write(payload)
  session = await read({ headers: { cookie } })
  console.log(`Current session:`, session)
  assert.strictEqual(session.one, 1, 'Returned session using default algorithm and custom secret')

  // Custom algo + custom secret
  process.env.ARC_APP_SECRET = 'abcdefghijklmnopqrstuvwx'
  process.env.ARC_APP_SECRET_ALGO = 'A192GCM'
  session = await read({ headers: { cookie } })
  console.log(`Current session:`, session)
  assert.deepStrictEqual(session, {}, 'Returned empty session (because secret changed)')
  cookie = await write(payload)
  session = await read({ headers: { cookie } })
  console.log(`Current session:`, session)
  assert.strictEqual(session.one, 1, 'Returned session using custom algorithm and secret')

  // Legacy mode
  process.env.ARC_FORCE_LEGACY_JWE_SECRET = true
  delete process.env.ARC_APP_SECRET
  delete process.env.ARC_APP_SECRET_ALGO
  session = await read({ headers: { cookie } })
  console.log(`Current session:`, session)
  assert.deepStrictEqual(session, {}, 'Returned empty session (because secret changed)')
  cookie = await write(payload)
  session = await read({ headers: { cookie } })
  console.log(`Current session:`, session)
  assert.strictEqual(session.one, 1, 'Returned session using default algorithm and custom secret')
  delete process.env.ARC_FORCE_LEGACY_JWE_SECRET
})

test('JWE errors', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'jwe'
  process.env.ARC_SESSION_TTL = 14400

  try {
    process.env.ARC_APP_SECRET_ALGO = 'foo'
    await write({})
  }
  catch (err) {
    assert.ok(err.message.includes('Invalid token algorithm'), 'Threw invalid token algo error')
    delete process.env.ARC_APP_SECRET_ALGO
  }

  try {
    process.env.ARC_APP_SECRET = 'abc123'
    await write({})
  }
  catch (err) {
    assert.ok(err.message.includes('Invalid secret length'), 'Threw invalid secret length error')
    delete process.env.ARC_APP_SECRET
  }
})

test('Start Sandbox for DynamoDB-backed sessions', (t, done) => {
  let cwd = join(process.cwd(), 'test', 'mock', 'project')
  sandbox.start({ cwd, quiet: true }, err => {
    if (err) assert.fail(err)
    else assert.ok(true, 'Sandbox started')
    done()
  })
})

test('DDB read + write', async () => {
  process.env.ARC_SESSION_TABLE_NAME = 'test-only-staging-arc-sessions'
  process.env.ARC_SESSION_TTL = 14400
  let fakerequest = {}
  let session = await read(fakerequest)
  assert.ok(session, 'read session cookie')
  session.one = 1
  let cookie = await write(session)
  assert.ok(cookie, 'wrote modified session cookie')
  let inception = await read({ headers: { Cookie: cookie } })
  console.log({ session, cookie, inception })
  assert.strictEqual(inception.one, 1, 'read back modified cookie')
  // Lambda payload version 2
  let inception2 = await read({ cookies: [ cookie ] })
  assert.strictEqual(inception2.one, 1, 'read back again from payload version 2')
  assert.match(cookie, new RegExp(`Max-Age=${process.env.ARC_SESSION_TTL}`), 'cookie max-age is set correctly')
})

test('Teardown', (t, done) => {
  delete process.env.ARC_APP_SECRET
  delete process.env.ARC_APP_SECRET_ALGO
  delete process.env.ARC_ENV
  delete process.env.ARC_FORCE_LEGACY_JWE_SECRET
  delete process.env.ARC_SESSION_DOMAIN
  delete process.env.ARC_SESSION_SAME_SITE
  delete process.env.ARC_SESSION_TABLE_NAME
  delete process.env.ARC_SESSION_TTL
  delete process.env.SESSION_DOMAIN
  sandbox.end(err => {
    if (err) assert.fail(err)
    else assert.ok(true, 'Sandbox ended')
    done()
  })
})
