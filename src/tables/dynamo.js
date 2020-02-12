let aws = require('aws-sdk')
let https = require('https')
// let clients = {}

/**
 * Instantiates Dynamo service interfaces
 * - Internal APIs should use `db` + `doc` to instantiate DynamoDB interfaces
 * - Avoid using `direct.db` + `direct.doc`: as it's an issue vector for using Functions in certain test harnesses!
 */
function getDynamo (type, callback) {
  if (!type) throw ReferenceError('Must supply Dynamo service interface type')

  let testing = process.env.NODE_ENV === 'testing'
  let port = process.env.ARC_TABLES_PORT || 5000
  let local = {
    endpoint: new aws.Endpoint(`http://localhost:${port}`),
    region: process.env.AWS_REGION || 'us-west-2' // Do not assume region is set!
  }
  let DB = aws.DynamoDB
  let Doc = aws.DynamoDB.DocumentClient
  let dynamo // Assigned below

  function updateConfig () {
    let agent = new https.Agent({
      keepAlive: true,
      maxSockets: 50,
      rejectUnauthorized: true,
    })
    aws.config.update({
      httpOptions: {agent}
    })
  }

  if (type === 'db') {
    if (!testing) {
      updateConfig()
    }
    dynamo = testing
      ? new DB(local)
      : new DB
  }

  if (type === 'doc') {
    if (!testing) {
      updateConfig()
    }
    dynamo = testing
      ? new Doc(local)
      : new Doc
  }

  if (type === 'session') {
    if (!testing) {
      updateConfig()
    }

    // if SESSION_TABLE_NAME isn't defined we mock the client and just pass session thru
    let passthru = !process.env.SESSION_TABLE_NAME
    let mock = {
      get(params, callback) {
        callback()
      },
      put(params, callback) {
        callback()
      }
    }
    dynamo = testing
      ? new Doc(local)
      : (passthru ? mock : new Doc)
  }

  if (!callback) return dynamo
  else callback(null, dynamo)
}

module.exports = {
  db: getDynamo.bind({}, 'db'),
  doc: getDynamo.bind({}, 'doc'),
  session: getDynamo.bind({}, 'session'),
  direct: {
    db: getDynamo('db'),
    doc: getDynamo('doc')
  }
}
