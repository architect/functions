let sandbox = require('@architect/sandbox')
let test = require('tape')
let { join } = require('path')
let WebSocket = require('ws')

let port = process.env.PORT ? process.env.PORT : '3333'
let url = `ws://localhost:${port}`

let mock = join(__dirname, '..', 'mock', 'project')

test('Set up env', async t => {
  t.plan(1)
  let result = await sandbox.start({ quiet: true, cwd: mock })
  t.equal(result, 'Sandbox successfully started', result)
})

test('Connect, get message, send message, get message, send disconnect, be disconnected', async t => {
  t.plan(3)
  let ws = new WebSocket(url)

  await new Promise(resolve => ws.once('open', resolve))
  ws.send(JSON.stringify({ message: 'hi' }))

  let infoMessage = await new Promise(resolve => ws.once('message', data => resolve(JSON.parse(data.toString('utf8')))))

  t.equal(infoMessage.message, 'hi back')
  t.equal(typeof infoMessage.info.ConnectedAt, 'string')

  ws.send(JSON.stringify({ message: 'disconnect me' }))

  await new Promise(resolve => ws.once('close', resolve))

  // At this point, it may be normal to see Sandbox errors in the console, like 'WebSocket is not open: readyState 3 (CLOSED)'
  // At this point in the test the @ws disconnect Lambda is just firing up, but we're about to shut down Sandbox, thereby creating a Lambda execution race condition
  // We'll have to fix that at some point in the future by ensuring Sandbox shuts down invocations before terminating

  t.pass('Disconnected')
})

test('Teardown', async t => {
  t.plan(1)
  let result = await sandbox.end()
  t.equal(result, 'Sandbox successfully shut down', result)
})
