const { join } = require('node:path')
const http = require('node:http')
const sandbox = require('@architect/sandbox')
const test = require('tape')
const tiny = require('tiny-json-http')
const cwd = process.cwd()
const mock = join(cwd, 'test', 'mock', 'project')
let server
const port = 1111
const url = (path) => `http://localhost:3333/publish-event/${path}`
const sane = encodeURI(JSON.stringify({ ok: true }))

function createServer() {
  server = http.createServer((req, res) => {
    res.writeHead(200)
    res.end()
  })
  server.listen(port)
  console.log('Started test server')
}
function closeServer() {
  return new Promise((res, rej) => {
    server.close((err) => {
      if (err) rej(err)
      else {
        console.log('Test server ended')
        res()
      }
    })
  })
}

test('Set up env', async (t) => {
  t.plan(2)
  await sandbox.start({ cwd: mock, quiet: true })
  t.pass('Sandbox started')
  createServer()
  t.ok(server, 'Reflection server started')
})

// These can almost certainly be dried up, but they should be good enough for now
test('@events pub/sub (continuation-passing handler)', (t) => {
  t.plan(2)
  const path = '/events/cb-event'
  const check = (req) => {
    const posted = req.url.split('?')
    t.equal(posted[0], path, 'Published callback event through the event bus')
    t.equal(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, (err) => {
    if (err) t.fail(err)
  })
})

test('@events pub/sub (async handler)', (t) => {
  t.plan(2)
  const path = '/events/async-event'
  const check = (req) => {
    const posted = req.url.split('?')
    t.equal(posted[0], path, 'Published async event through the event bus')
    t.equal(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, (err) => {
    if (err) t.fail(err)
  })
})

test('@queues pub/sub (continuation-passing handler)', (t) => {
  t.plan(2)
  const path = '/queues/cb-queue'
  const check = (req) => {
    const posted = req.url.split('?')
    t.equal(posted[0], path, 'Published callback queue through the queue bus')
    t.equal(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, (err) => {
    if (err) t.fail(err)
  })
})

test('@queues pub/sub (async handler)', (t) => {
  t.plan(2)
  const path = '/queues/async-queue'
  const check = (req) => {
    const posted = req.url.split('?')
    t.equal(posted[0], path, 'Published async queue through the queue bus')
    t.equal(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, (err) => {
    if (err) t.fail(err)
  })
})

test('Teardown', async (t) => {
  t.plan(1)
  await closeServer()
  await sandbox.end()
  t.pass('Sandbox ended, server closed')
})
