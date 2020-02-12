let test = require('tape')
let file = '../../../../src/tables/dynamo'
let dynamo
let env = process.env.NODE_ENV

function reset (t) {
  delete process.env.ARC_TABLES_PORT
  delete process.env.AWS_REGION
  delete process.env.SESSION_TABLE_NAME
  delete require.cache[require.resolve(file)]
  dynamo = undefined

  if (process.env.ARC_TABLES_PORT) t.fail('Did not unset ARC_TABLES_PORT')
  if (process.env.AWS_REGION) t.fail('Did not unset AWS_REGION')
  if (process.env.SESSION_TABLE_NAME) t.fail('Did not unset SESSION_TABLE_NAME')
  if (require.cache[require.resolve(file)]) t.fail('Did not reset require cache')
  if (dynamo) t.fail('Did not unset module')
}

test('Set up env', t => {
  t.plan(5)
  process.env.NODE_ENV = 'testing'

  // eslint-disable-next-line
  dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.ok(db, 'Got DynamoDB object (callback)')
  })
  // DB x direct
  t.ok(dynamo.direct.db, 'Got DynamoDB object (direct)')

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.ok(doc, 'Got DynamoDB document object (callback)')
  })
  // Doc x direct
  t.ok(dynamo.direct.doc, 'Got DynamoDB document object (direct)')

  // Session x callback
  dynamo.session((err, doc) => {
    if (err) t.fail(err)
    t.ok(doc, 'Got DynamoDB sesion document object (callback)')
  })

  reset(t)
})

test('Local port + region configuration', t => {
  t.plan(50)

  /**
   * Defaults
   */
  let localhost = 'localhost'
  let defaultPort = 5000
  let defaultRegion = 'us-west-2'
  let host = `${localhost}:${defaultPort}`

  // eslint-disable-next-line
  dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.equal(db.endpoint.host, host, `DB configured 'host' property is ${host}`)
    t.equal(db.endpoint.hostname, localhost, `DB configured 'hostname' property is ${localhost}`)
    t.equal(db.endpoint.href, `http://${host}/`, `DB configured 'href' property is http://${host}/`)
    t.equal(db.endpoint.port, defaultPort, `DB configured 'port' property is ${defaultPort}`)
    t.equal(db.config.region, defaultRegion, `DB configured 'region' property is ${defaultRegion}`)
  })
  // DB x direct
  t.equal(dynamo.direct.db.endpoint.host, host, `DB configured 'host' property is ${host}`)
  t.equal(dynamo.direct.db.endpoint.hostname, localhost, `DB configured 'hostname' property is ${localhost}`)
  t.equal(dynamo.direct.db.endpoint.href, `http://${host}/`, `DB configured 'href' property is http://${host}/`)
  t.equal(dynamo.direct.db.endpoint.port, defaultPort, `DB configured 'port' property is ${defaultPort}`)
  t.equal(dynamo.direct.db.config.region, defaultRegion, `DB configured 'region' property is ${defaultRegion}`)

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.equal(doc.options.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    t.equal(doc.options.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    t.equal(doc.options.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    t.equal(doc.options.endpoint.port, defaultPort, `Doc configured 'port' property is ${defaultPort}`)
    t.equal(doc.service.config.region, defaultRegion, `Doc configured 'region' property is ${defaultRegion}`)
  })
  // Doc x direct
  t.equal(dynamo.direct.doc.options.endpoint.host, host, `Doc configured 'host' property is ${host}`)
  t.equal(dynamo.direct.doc.options.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
  t.equal(dynamo.direct.doc.options.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
  t.equal(dynamo.direct.doc.options.endpoint.port, defaultPort, `Doc configured 'port' property is ${defaultPort}`)
  t.equal(dynamo.direct.doc.service.config.region, defaultRegion, `Doc configured 'region' property is ${defaultRegion}`)

  // Session x callback
  dynamo.session((err, doc) => {
    if (err) t.fail(err)
    t.equal(doc.options.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    t.equal(doc.options.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    t.equal(doc.options.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    t.equal(doc.options.endpoint.port, defaultPort, `Doc configured 'port' property is ${defaultPort}`)
    t.equal(doc.service.config.region, defaultRegion, `Doc configured 'region' property is ${defaultRegion}`)
  })

  reset(t)

  /**
   * Custom
   */
  let customPort = 5555
  let customRegion = 'us-east-1'
  process.env.ARC_TABLES_PORT = customPort
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
  // DB x direct
  t.equal(dynamo.direct.db.endpoint.host, host, `DB configured 'host' property is ${host}`)
  t.equal(dynamo.direct.db.endpoint.hostname, localhost, `DB configured 'hostname' property is ${localhost}`)
  t.equal(dynamo.direct.db.endpoint.href, `http://${host}/`, `DB configured 'href' property is http://${host}/`)
  t.equal(dynamo.direct.db.endpoint.port, customPort, `DB configured 'port' property is ${customPort}`)
  t.equal(dynamo.direct.db.config.region, customRegion, `DB configured 'region' property is ${customRegion}`)

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.equal(doc.options.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    t.equal(doc.options.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    t.equal(doc.options.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    t.equal(doc.options.endpoint.port, customPort, `Doc configured 'port' property is ${customPort}`)
    t.equal(doc.service.config.region, customRegion, `Doc configured 'region' property is ${customRegion}`)
  })
  // DB x direct
  t.equal(dynamo.direct.doc.options.endpoint.host, host, `Doc configured 'host' property is ${host}`)
  t.equal(dynamo.direct.doc.options.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
  t.equal(dynamo.direct.doc.options.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
  t.equal(dynamo.direct.doc.options.endpoint.port, customPort, `Doc configured 'port' property is ${customPort}`)
  t.equal(dynamo.direct.doc.service.config.region, customRegion, `Doc configured 'region' property is ${customRegion}`)

  // Session x callback
  dynamo.session((err, doc) => {
    if (err) t.fail(err)
    t.equal(doc.options.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    t.equal(doc.options.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    t.equal(doc.options.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    t.equal(doc.options.endpoint.port, customPort, `Doc configured 'port' property is ${customPort}`)
    t.equal(doc.service.config.region, customRegion, `Doc configured 'region' property is ${customRegion}`)
  })

  reset(t)
})

test('Live AWS infra config', t => {
  t.plan(10)

  // Defaults
  process.env.NODE_ENV = 'testing'

  // eslint-disable-next-line
  dynamo = require(file)

  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.notOk(db.config.httpOptions.agent, 'DB HTTP agent options not set')
  })
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.notOk(doc.service.config.httpOptions.agent, 'Doc HTTP agent options not set')
  })
  t.notOk(dynamo.direct.db.config.httpOptions.agent, 'DB HTTP agent options not set')
  t.notOk(dynamo.direct.doc.service.config.httpOptions.agent, 'Doc HTTP agent options not set')

  reset(t)

  // Defaults
  process.env.NODE_ENV = 'staging'
  process.env.AWS_REGION = 'us-west-1'

  // eslint-disable-next-line
  dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) t.fail(err)
    t.ok(db.config.httpOptions.agent.options, 'DB HTTP agent options set')
  })
  // DB x direct
  t.ok(dynamo.direct.db.config.httpOptions.agent.options, 'DB HTTP agent options set')

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) t.fail(err)
    t.ok(doc.service.config.httpOptions.agent.options, 'Doc HTTP agent options set')
  })
  // Doc x direct
  t.ok(dynamo.direct.doc.service.config.httpOptions.agent.options, 'Doc HTTP agent options set')

  // Session x callback (session table not configured)
  dynamo.session((err, mock) => {
    if (err) t.fail(err)
    t.ok(typeof mock.get === 'function' && typeof mock.put === 'function', 'Got back sessions get/put mock')
  })
  // Session x callback (session table configured)
  process.env.SESSION_TABLE_NAME = 'foo'
  dynamo.session((err, doc) => {
    if (err) t.fail(err)
    t.ok(doc.service.config.httpOptions.agent.options, 'Doc HTTP agent options set')
  })

  reset(t)
})

test('Tear down env', t => {
  t.plan(1)
  process.env.NODE_ENV = env
  reset(t)
  t.pass('Tore down env')
})
