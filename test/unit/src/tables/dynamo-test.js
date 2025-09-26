/*
// NOTE: This test is commented out because src/tables/dynamo.js does not exist
// The test has been migrated to Node.js test runner syntax for future use

const { test } = require('node:test')
const assert = require('node:assert')
const file = '../../../../src/tables/dynamo'
let dynamo

function reset () {
  delete process.env.ARC_ENV
  delete process.env.ARC_SANDBOX
  delete process.env.AWS_REGION
  delete process.env.ARC_SESSION_TABLE_NAME
  delete require.cache[require.resolve(file)]
  dynamo = undefined

  if (process.env.ARC_SANDBOX) assert.fail('Did not unset ARC_SANDBOX')
  if (process.env.AWS_REGION) assert.fail('Did not unset AWS_REGION')
  if (process.env.ARC_SESSION_TABLE_NAME) assert.fail('Did not unset ARC_SESSION_TABLE_NAME')
  if (require.cache[require.resolve(file)]) assert.fail('Did not reset require cache')
  if (dynamo) assert.fail('Did not unset module')
}

test('Set up env', (t, done) => {
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: 5555 } })

  // eslint-disable-next-line
  dynamo = require(file)

  let completed = 0
  const checkComplete = () => {
    completed++
    if (completed === 2) {
      reset()
      done()
    }
  }

  // DB x callback
  dynamo.db((err, db) => {
    if (err) assert.fail(err)
    assert.ok(db, 'Got DynamoDB object (callback)')
    checkComplete()
  })

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) assert.fail(err)
    assert.ok(doc, 'Got DynamoDB document object (callback)')
    checkComplete()
  })
})

test('Local port + region configuration', (t, done) => {
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: 5555 } })
  const localhost = 'localhost'
  const defaultPort = 5555
  const defaultRegion = 'us-west-2'
  let host = `${localhost}:${defaultPort}`

  // eslint-disable-next-line
  dynamo = require(file)

  let completed = 0
  const checkComplete = () => {
    completed++
    if (completed === 4) {
      reset()
      done()
    }
  }

  // DB x callback
  dynamo.db(async (err, db) => {
    if (err) assert.fail(err)
    assert.strictEqual(db.endpoint.host, host, `DB configured 'host' property is ${host}`)
    assert.strictEqual(db.endpoint.hostname, localhost, `DB configured 'hostname' property is ${localhost}`)
    assert.strictEqual(db.endpoint.href, `http://${host}/`, `DB configured 'href' property is http://${host}/`)
    assert.strictEqual(db.endpoint.port, defaultPort, `DB configured 'port' property is ${defaultPort}`)
    assert.strictEqual(db.config.region, defaultRegion, `DB configured 'region' property is ${defaultRegion}`)
    checkComplete()
  })

  // Doc x callback
  // For whatever mysterious reason(s), docs configure their endpoint under doc.service.endpoint, not doc.endpoint
  dynamo.doc((err, doc) => {
    if (err) assert.fail(err)
    assert.strictEqual(doc.service.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    assert.strictEqual(doc.service.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    assert.strictEqual(doc.service.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    assert.strictEqual(doc.service.endpoint.port, defaultPort, `Doc configured 'port' property is ${defaultPort}`)
    assert.strictEqual(doc.service.config.region, defaultRegion, `Doc configured 'region' property is ${defaultRegion}`)
    checkComplete()
  })

  // Reset and test custom configuration
  reset()

  const customPort = 5666
  const customRegion = 'us-east-1'
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: customPort } })
  process.env.AWS_REGION = customRegion
  host = `${localhost}:${customPort}`

  // eslint-disable-next-line
  dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) assert.fail(err)
    assert.strictEqual(db.endpoint.host, host, `DB configured 'host' property is ${host}`)
    assert.strictEqual(db.endpoint.hostname, localhost, `DB configured 'hostname' property is ${localhost}`)
    assert.strictEqual(db.endpoint.href, `http://${host}/`, `DB configured 'href' property is http://${host}/`)
    assert.strictEqual(db.endpoint.port, customPort, `DB configured 'port' property is ${customPort}`)
    assert.strictEqual(db.config.region, customRegion, `DB configured 'region' property is ${customRegion}`)
    checkComplete()
  })

  // Doc x callback
  // For whatever mysterious reason(s), docs configure their endpoint under doc.service.endpoint, not doc.endpoint
  dynamo.doc((err, doc) => {
    if (err) assert.fail(err)
    assert.strictEqual(doc.service.endpoint.host, host, `Doc configured 'host' property is ${host}`)
    assert.strictEqual(doc.service.endpoint.hostname, localhost, `Doc configured 'hostname' property is ${localhost}`)
    assert.strictEqual(doc.service.endpoint.href, `http://${host}/`, `Doc configured 'href' property is http://${host}/`)
    assert.strictEqual(doc.service.endpoint.port, customPort, `Doc configured 'port' property is ${customPort}`)
    assert.strictEqual(doc.service.config.region, customRegion, `Doc configured 'region' property is ${customRegion}`)
    checkComplete()
  })
})

test('Live AWS infra config', (t, done) => {
  // Defaults
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: { tables: 5555 } })

  // eslint-disable-next-line
  dynamo = require(file)

  let completed = 0
  const checkComplete = () => {
    completed++
    if (completed === 4) {
      reset()
      done()
    }
  }

  // DB x callback
  dynamo.db((err, db) => {
    if (err) assert.fail(err)
    assert.ok(!db.config.httpOptions.agent, 'DB HTTP agent options not set')
    checkComplete()
  })

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) assert.fail(err)
    assert.ok(!doc.service.config.httpOptions.agent, 'Doc HTTP agent options not set')
    checkComplete()
  })

  reset()

  // Defaults
  process.env.ARC_ENV = 'staging'
  process.env.AWS_REGION = 'us-west-1'

  // eslint-disable-next-line
  dynamo = require(file)

  // DB x callback
  dynamo.db((err, db) => {
    if (err) assert.fail(err)
    assert.ok(db.config.httpOptions.agent.options, 'DB HTTP agent options set')
    checkComplete()
  })

  // Doc x callback
  dynamo.doc((err, doc) => {
    if (err) assert.fail(err)
    assert.ok(doc.service.config.httpOptions.agent.options, 'Doc HTTP agent options set')
    checkComplete()
  })
})

test('Tear down env', () => {
  reset()
  assert.ok(true, 'Tore down env')
})
*/
