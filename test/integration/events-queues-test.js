let { join } = require('path')
let http = require('http')
let sandbox = require('@architect/sandbox')
const { test } = require('node:test')
const assert = require('node:assert')
let tiny = require('tiny-json-http')
let cwd = process.cwd()
let mock = join(cwd, 'test', 'mock', 'project')
let server
let port = 1111
let url = path => `http://localhost:3333/publish-event/${path}`
let sane = encodeURI(JSON.stringify({ ok: true }))

function createServer () {
  server = http.createServer((req, res) => {
    res.writeHead(200)
    res.end()
  })
  server.listen(port)
  console.log('Started test server')
}
function closeServer () {
  return new Promise((res, rej) => {
    server.close(err => {
      if (err) rej(err)
      else {
        console.log(`Test server ended`)
        res()
      }
    })
  })
}

test('Set up env', async () => {
  await sandbox.start({ cwd: mock, quiet: true })
  createServer()
  assert.ok(server, 'Reflection server started')
})

// These can almost certainly be dried up, but they should be good enough for now
test('@events pub/sub (continuation-passing handler)', (t, done) => {
  let path = '/events/cb-event'
  let check = req => {
    let posted = req.url.split('?')
    assert.strictEqual(posted[0], path, 'Published callback event through the event bus')
    assert.strictEqual(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
    done()
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, err => {
    if (err) assert.fail(err)
  })
})

test('@events pub/sub (async handler)', (t, done) => {
  let path = '/events/async-event'
  let check = req => {
    let posted = req.url.split('?')
    assert.strictEqual(posted[0], path, 'Published async event through the event bus')
    assert.strictEqual(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
    done()
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, err => {
    if (err) assert.fail(err)
  })
})

test('@queues pub/sub (continuation-passing handler)', (t, done) => {
  let path = '/queues/cb-queue'
  let check = req => {
    let posted = req.url.split('?')
    assert.strictEqual(posted[0], path, 'Published callback queue through the queue bus')
    assert.strictEqual(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
    done()
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, err => {
    if (err) assert.fail(err)
  })
})

test('@queues pub/sub (async handler)', (t, done) => {
  let path = '/queues/async-queue'
  let check = req => {
    let posted = req.url.split('?')
    assert.strictEqual(posted[0], path, 'Published async queue through the event bus')
    assert.strictEqual(posted[1], sane, 'Got payload')
    server.removeListener('request', check)
    done()
  }
  server.on('request', check)
  tiny.post({ url: url(path) }, err => {
    if (err) assert.fail(err)
  })
})

test('Teardown', async () => {
  await closeServer()
  await sandbox.end()
})
