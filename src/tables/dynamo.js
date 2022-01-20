let aws = require('aws-sdk')
let https = require('https')

/**
 * Instantiates Dynamo service interfaces
 * - Internal APIs should use `db` + `doc` to instantiate DynamoDB interfaces
 * - Avoid using `direct.db` + `direct.doc`: as it's an issue vector for using Functions in certain test harnesses!
 */
function getDynamo (type, callback) {
  if (!type) throw ReferenceError('Must supply Dynamo service interface type')

  // We might normally like to throw if `local && !port`, but this is also a direct DynamoDB interface in global scope, so it instantiates even if the project doesn't have tables.
  let { ARC_ENV: env, ARC_LOCAL, ARC_TABLES_PORT: port } = process.env
  let local = env === 'testing' || ARC_LOCAL
  let localConfig = {
    endpoint: new aws.Endpoint(`http://localhost:${port}`),
    region: process.env.AWS_REGION || 'us-west-2' // Do not assume region is set!
  }
  let DB = aws.DynamoDB
  let Doc = aws.DynamoDB.DocumentClient
  let dynamo // Assigned below

  /**
   * This module may be loaded by @arc/arc via repl
   * - The `direct` interfaces will instantiate before ARC_ENV is set
   * - Thus, unlike most other scenarios, don't assume the presence of ARC_ENV
   * - Also: some test harnesses (ahem) will automatically populate ARC_ENV with their own values, unbidden
   * - *Why this matters*: using https.Agent (and not http.Agent) will stall the Sandbox
   */
  if (!local) {
    let agent = new https.Agent({
      keepAlive: true,
      maxSockets: 50, // Node can set to Infinity; AWS maxes at 50; check back on this every once in a while
      rejectUnauthorized: true,
    })
    aws.config.update({
      httpOptions: { agent }
    })
    // TODO? migrate to using `AWS_NODEJS_CONNECTION_REUSE_ENABLED`?
  }

  if (type === 'db') {
    dynamo = local
      ? new DB(localConfig)
      : new DB
  }

  if (type === 'doc') {
    dynamo = local
      ? new Doc(localConfig)
      : new Doc
  }

  if (type === 'session') {
    // if SESSION_TABLE_NAME isn't defined we mock the client and just pass session thru
    let passthru = !process.env.SESSION_TABLE_NAME
    let mock = {
      get (params, callback) {
        callback()
      },
      put (params, callback) {
        callback()
      }
    }
    dynamo = local
      ? new Doc(localConfig)
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
