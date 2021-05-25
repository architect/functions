let sandbox = require('@architect/sandbox')
let read = require('../../../../../src/http/session/read')
let write = require('../../../../../src/http/session/write')
let test = require('tape')
let join = require('path').join

test('http.session apis exist', t => {
  t.plan(2)
  t.ok(read, 'http.session.read')
  t.ok(write, 'http.session.write')
})

test('jwe read and write implementations', async t => {
  t.plan(5)
  process.env.SESSION_TABLE_NAME = 'jwe'
  process.env.SESSION_TTL = 14400
  let fakerequest = {}
  let session = await read(fakerequest)
  t.ok(session, 'read session cookie')
  session.one = 1
  let cookie = await write(session)
  t.ok(cookie, 'wrote session cookie')
  let inception = await read({ headers: { Cookie: cookie } })
  t.comment(JSON.stringify(session))
  t.comment(JSON.stringify(cookie))
  t.comment(JSON.stringify(inception))
  t.equal(inception.one, 1, 'read back again')
  // Lambda payload version 2
  let inception2 = await read({ cookies: [ cookie ] })
  t.equal(inception2.one, 1, 'read back again from payload version 2')
  t.match(cookie, new RegExp(`Max-Age=${process.env.SESSION_TTL}`), 'cookie max-age is set correctly')
})

test('jwe SameSite is configurable', async t => {
  t.plan(2)
  process.env.SESSION_TABLE_NAME = 'jwe'
  process.env.SESSION_TTL = 14400
  let session = {}
  // default value:
  delete process.env.ARC_SESSION_SAME_SITE
  let cookie = await write(session)
  t.match(cookie, /SameSite=Lax/, 'cookie SameSite is set correctly to default')
  // configured value:
  process.env.ARC_SESSION_SAME_SITE = 'None'
  cookie = await write(session)
  t.match(cookie, new RegExp(`SameSite=${process.env.ARC_SESSION_SAME_SITE}`), 'cookie SameSite is set correctly to configured value')
})

test('set up sandbox for ddb testing', t => {
  t.plan(1)
  process.chdir(join(process.cwd(), 'test', 'mock', 'project'))
  sandbox.start({}, err => {
    if (err) t.fail(err)
    else t.pass('Sandbox started')
  })
})

test('ddb read and write implementations', async t => {
  t.plan(5)
  process.env.SESSION_TABLE_NAME = 'test-only-staging-arc-sessions'
  process.env.SESSION_TTL = 14400
  let fakerequest = {}
  let session = await read(fakerequest)
  t.ok(session, 'read session cookie')
  session.one = 1
  let cookie = await write(session)
  t.ok(cookie, 'wrote modified session cookie')
  let inception = await read({ headers: { Cookie: cookie } })
  t.comment(JSON.stringify(session))
  t.comment(JSON.stringify(cookie))
  t.comment(JSON.stringify(inception))
  t.equals(inception.one, 1, 'read back modified cookie')
  // Lambda payload version 2
  let inception2 = await read({ cookies: [ cookie ] })
  t.equals(inception2.one, 1, 'read back again from payload version 2')
  t.match(cookie, new RegExp(`Max-Age=${process.env.SESSION_TTL}`), 'cookie max-age is set correctly')
})

test('shutdown sandbox', t => {
  t.plan(1)
  delete process.env.SESSION_TABLE_NAME
  delete process.env.SESSION_TTL
  sandbox.end(err => {
    if (err) t.fail(err)
    else t.pass('Sandbox started')
  })
})
