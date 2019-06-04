let arc = require('@architect/architect')
let read = require('../src/http/session/read')
let write = require('../src/http/session/write')
let test= require('tape')

test('http.session', t=> {
  t.plan(2)
  t.ok(read, 'http.session.read')
  t.ok(write, 'http.session.write')
})

test('jwe', async t=> {
  t.plan(3)
  process.env.SESSION_TABLE_NAME = 'jwe'
  let fakerequest = {}
  let session = await read(fakerequest)
  session.one = 1
  let cookie = await write(session)
  t.ok(session, 'read session cookie')
  t.ok(cookie, 'wrote session cookie')
  let inception = await read({headers:{Cookie:cookie}})
  t.ok(inception.one === 1, 'read back again')
  console.log(session, cookie)
})

let end
test('arc.sandbox.start', async t=> {
  t.plan(1)
  end = await arc.sandbox.start()
  t.ok(true, 'started sandbox')
})

test('ddb', async t=> {
  t.plan(3)
  process.env.SESSION_TABLE_NAME = 'arc-sessions'
  let fakerequest = {}
  let session = await read(fakerequest)
  session.one = 1
  let cookie = await write(session)
  t.ok(session, 'read session cookie')
  t.ok(cookie, 'wrote session cookie')
  let inception = await read({headers:{Cookie:cookie}})
  t.ok(inception.one === 1, 'read back again')
  console.log(session, cookie)
})

test('cleanup', async t=> {
  t.plan(1)
  end()
  t.ok(true, 'sandbox shutdown')
})
