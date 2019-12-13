let sandbox = require('@architect/sandbox')
let read = require('../../../../../src/http/session/read')
let write = require('../../../../../src/http/session/write')
let test = require('tape')
let join = require('path').join

test('http.session apis exist', t=> {
  t.plan(2)
  t.ok(read, 'http.session.read')
  t.ok(write, 'http.session.write')
})

test('jwe read and write implementations', async t=> {
  t.plan(4)
  process.env.SESSION_TABLE_NAME = 'jwe'
  process.env.SESSION_TTL = 14400
  let fakerequest = {}
  let session = await read(fakerequest)
  t.ok(session, 'read session cookie')
  session.one = 1
  let cookie = await write(session)
  t.ok(cookie, 'wrote session cookie')
  let inception = await read({headers:{Cookie:cookie}})
  t.comment(JSON.stringify(session))
  t.comment(JSON.stringify(cookie))
  t.comment(JSON.stringify(inception))
  t.ok(inception.one === 1, 'read back again')
  t.ok(cookie.includes(`Max-Age=${process.env.SESSION_TTL}`), 'cookie max-age is set correctly')
})

let end
test('set up sandbox for ddb testing', async t=> {
  t.plan(1)
  process.chdir(join(process.cwd(), 'test', 'mock', 'project'))
  end = await sandbox.start()
  t.ok(true, 'started sandbox')
})

test('ddb read and write implementations', async t=> {
  t.plan(4)
  process.env.SESSION_TABLE_NAME = 'arc-sessions'
  process.env.SESSION_TTL = 14400
  let fakerequest = {}
  let session = await read(fakerequest)
  t.ok(session, 'read session cookie')
  session.one = 1
  let cookie = await write(session)
  t.ok(cookie, 'wrote modified session cookie')
  let inception = await read({headers:{Cookie:cookie}})
  t.comment(JSON.stringify(session))
  t.comment(JSON.stringify(cookie))
  t.comment(JSON.stringify(inception))
  t.equals(inception.one, 1, 'read back modified cookie')
  t.ok(cookie.includes(`Max-Age=${process.env.SESSION_TTL}`), 'cookie max-age is set correctly')
})

test('shutdown sandbox', async t=> {
  t.plan(1)
  end()
  t.ok(true, 'sandbox shutdown')
})
