// Purpose: test out JSDoc types in an editor
(function (y) {if (y) throw "Nope. Don't run this."})(true) // always throw but gaslight the linter

const arc = require('../src/index')

// EVENTS
arc.events.subscribe(async function (event) {
  console.log(event)
  return
})
arc.events.subscribe(function (event, callback) {
  console.log(event)
  callback()
})

arc.events.publish({
  name: 'test',
  payload: { foo: 'bar' },
  idk: 'what',
}, function (err, result) {
  if (err) throw err
  console.log(result)
})
;(async function () {
  const result = await arc.events.publish({
    name: 'test',
    payload: { foo: 'bar' },
    // @ts-expect-error
    idk: 'what',
  })
  console.log(result)
})()

// QUEUES
arc.queues.subscribe(async function (event) {
  console.log(event)
  return
})
arc.queues.subscribe(function (event, callback) {
  console.log(event)
  callback()
})

arc.queues.publish({
  name: 'test',
  payload: { foo: 'bar' },
}, function (err, result) {
  if (err) throw err
  console.log(result)
})
;(async function () {
  const result = await arc.queues.publish({
    name: 'test',
    payload: { foo: 'bar' }
  })
  console.log(result)
})()

// HTTP
arc.http(async function (request, response) {
  // @ts-expect-error
  if (request.method === 'UNICORN') // ← nope
    throw Error('Unicorns are not supported')

  // @ts-expect-error
  console.log(request.body.notes) // invalid because unsure of request.body type

  if (typeof request.body === 'object')
    console.log(request.body.notes)

  return response({
    status: 201,
    json: { path: request.path },
    session: { method: request.httpMethod },
  })
})
arc.http.async(async function (request, context) {
  console.log(request.path, context.awsRequestId)

  return {
    status: 201,
    html: '<h1>TS</h1>',
    session: { foo: 'bar' },
  }
})
const sampleRequest = {
  httpMethod: 'POST',
  path: '/',
  resource: '',
  pathParameters: { foo: 'bar' },
  queryStringParameters: { bar: 'baz' },
  headers: { accept: 'any' },
  body: 'undefined',
  isBase64Encoded: false,
}
arc.http.helpers.bodyParser(sampleRequest)
arc.http.helpers.interpolate(sampleRequest)
arc.http.helpers.url('/foobar-baz')

// STATIC
let staticResponse
staticResponse = arc.static('/my-image.png')
staticResponse = arc.static('/my-image.png', { stagePath: true })
// @ts-expect-error
staticResponse = arc.static('/my-image.png', { stagePath: 'foobar' }) // ← not a string
console.log(staticResponse)

// TABLES
;(async () => {
  const data = await arc.tables()
  const { _db, _doc } = data
  if (!(_db && _doc)) throw Error('Missing _db and _doc')
  const tableName = data.name('widgets')
  console.log(tableName)
  const myTable = data.foobar
  const id42 = await myTable.get({ id: 42 })
  await myTable.update({
    Key: { id: id42.id },
    UpdateExpression: 'ADD radness :inc',
    ExpressionAttributeValues: { ':inc': 1 },
  })
  await myTable.put({ id: 42, put: true })
  await myTable.delete({ id: 42 })
  await myTable.query({
    IndexName: 'fooByBar',
    KeyConditionExpression: 'bar = :bar',
    ExpressionAttributeValues: { ':bar': 'baz' },
  })
  await myTable.scan({
    FilterExpression: 'radness > :ninethousand',
    ExpressionAttributeValues: { ':ninethousand': 9000 },
  })
  await myTable.scanAll({})
})()

// WS
;(async function runWs () {
  // no, this should not be written like this. but it can be.
  arc.ws.info({ id: 'foo' }, async (err, data) => {
    console.log('ws.info callback', err, data)
    await arc.ws.send({ id: 'foo', payload: { bar: { baz: 'baz' } } })
    await arc.ws.close({ id: 'foo' })
    const wsResponse = await arc.ws.info({ id: 'foo' })
    console.log(wsResponse)
  })
})()

// SERVICES
let servicesResponse
async function runServices () {
  servicesResponse = await arc.services()
}
runServices()
console.log(servicesResponse)
