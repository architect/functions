/*
let test = require('tape')
let file = '../../../../src/tables/dynamo'
let dynamo

function reset (t) {
  delete process.env.ARC_ENV
  delete process.env.ARC_SANDBOX
  delete process.env.AWS_REGION
  delete process.env.ARC_SESSION_TABLE_NAME
  delete require.cache[require.resolve(file)]
  dynamo = undefined

  if (process.env.ARC_SANDBOX) t.fail('Did not unset ARC_SANDBOX')
  if (process.env.AWS_REGION) t.fail('Did not unset AWS_REGION')
  if (process.env.ARC_SESSION_TABLE_NAME) t.fail('Did not unset ARC_SESSION_TABLE_NAME')
  if (require.cache[require.resolve(file)]) t.fail('Did not reset require cache')
  if (dynamo) t.fail('Did not unset module')
}

test('Set up env', t => {
  t.plan(2)
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: 5555 } })

  // eslint-disable-next-line
  dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.ok(db, 'Got DynamoDB object (callback)')
  })

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.ok(doc, 'Got DynamoDB document object (callback)')
  })

  reset(t)
})

test('Local port + region configuration', t => {
  t.plan(20)

  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: 5555 } })
  let localhost = 'localhost'
  let defaultPort = 5555
  let defaultRegion = 'us-west-2'
  let host = `${localhost}:${defaultPort}`

  // eslint-disable-next-line
  dynamo = require(file)

  // DB x callback
  dynamo.db(async (err, db) => {
    if (err) t.fail(err)
    t.equal(db.endpoint.host, host, `DB configured 'host' property is ${host}`)
    t.equal(db.endpoint.hostname, localhost, `DB configured 'hostname' property is ${localhost}`)
    t.equal(db.endpoint.href, `http://${host}/`, `DB configured 'href' property is http://${host}/`)
    t.equal(db.endpoint.port, defaultPort, `DB configured 'port' property is ${defaultPort}`)
    t.equal(db.config.region, defaultRegion, `DB configured 'region' property is ${defaultRegion}`)
  })

  // Doc x callback
  // For whatever mysterious reason(s), docs configure their endpoint under doc.service.endpoint, not doc.endpoint
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.equal(doc.service.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    t.equal(doc.service.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    t.equal(doc.service.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    t.equal(doc.service.endpoint.port, defaultPort, `Doc configured 'port' property is ${defaultPort}`)
    t.equal(doc.service.config.region, defaultRegion, `Doc configured 'region' property is ${defaultRegion}`)
  })

  reset(t)

  let customPort = 5666
  let customRegion = 'us-east-1'
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: customPort } })
  process.env.AWS_REGION = customRegion
  host = `${localhost}:${customPort}`

  // eslint-disable-next-line
    dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.equal(db.endpoint.host, host, `DB configured 'host' property is ${host}`)
    t.equal(db.endpoint.hostname, localhost, `DB configured 'hostname' property is ${localhost}`)
    t.equal(db.endpoint.href, `http://${host}/`, `DB configured 'href' property is http://${host}/`)
    t.equal(db.endpoint.port, customPort, `DB configured 'port' property is ${customPort}`)
    t.equal(db.config.region, customRegion, `DB configured 'region' property is ${customRegion}`)
  })

  // Doc x callback
  // For whatever mysterious reason(s), docs configure their endpoint under doc.service.endpoint, not doc.endpoint
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.equal(doc.service.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    t.equal(doc.service.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    t.equal(doc.service.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    t.equal(doc.service.endpoint.port, customPort, `Doc configured 'port' property is ${customPort}`)
    t.equal(doc.service.config.region, customRegion, `Doc configured 'region' property is ${customRegion}`)
  })

  reset(t)
})

test('Live AWS infra config', t => {
  t.plan(4)

  // Defaults
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: 5555 } })

  // eslint-disable-next-line
    dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.notOk(db.config.httpOptions.agent, 'DB HTTP agent options not set')
  })

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.notOk(doc.service.config.httpOptions.agent, 'Doc HTTP agent options not set')
  })

  reset(t)

  // Defaults
  process.env.ARC_ENV = 'staging'
  process.env.AWS_REGION = 'us-west-1'

  // eslint-disable-next-line
    dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.ok(db.config.httpOptions.agent.options, 'DB HTTP agent options set')
  })

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.ok(doc.service.config.httpOptions.agent.options, 'Doc HTTP agent options set')
  })

  reset(t)
})

test('Tear down env', t => {
  t.plan(1)
  reset(t)
  t.pass('Tore down env')
})
*/
