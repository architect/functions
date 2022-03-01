let https = require('https')
let getPorts = require('../lib/get-ports')
let db, doc

/**
 * Instantiates Dynamo service interfaces
 * - Internal APIs should use `db` + `doc` to instantiate DynamoDB interfaces
 * - Avoid using `direct.db` + `direct.doc`: as it's an issue vector for using Functions in certain test harnesses!
 */
function getDynamo (type, callback) {
  if (!type) throw ReferenceError('Must supply Dynamo service interface type')

  // We really only want to load aws-sdk if absolutely necessary
  // eslint-disable-next-line
  let dynamo = require('aws-sdk/clients/dynamodb')

  // We might normally like to throw if `local && !port`, but this is also a direct DynamoDB interface in global scope
  // Thus, this path instantiates even if the project doesn't have tables
  let {
    ARC_ENV,
    ARC_LOCAL,
    AWS_REGION,
  } = process.env
  let local = ARC_ENV === 'testing' || ARC_LOCAL
  let DB = dynamo
  let Doc = dynamo.DocumentClient

  if (db && type === 'db') {
    return callback(null, db)
  }
  if (doc && type === 'doc') {
    return callback(null, doc)
  }

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
    let config = {
      httpOptions: { agent }
    }
    // TODO? migrate to using `AWS_NODEJS_CONNECTION_REUSE_ENABLED`?

    if (type === 'db') {
      db = new DB(config)
      return callback(null, db)
    }
    if (type === 'doc') {
      doc = new Doc(config)
      return callback(null, doc)
    }
  }
  else {
    getPorts((err, ports) => {
      if (err) callback(err)
      else {
        let port = ports.tables
        if (!port) {
          return callback(ReferenceError('Sandbox tables port not found'))
        }
        let config = {
          endpoint: `http://localhost:${port}`,
          region: AWS_REGION || 'us-west-2' // Do not assume region is set!
        }
        if (type === 'db') {
          db = new DB(config)
          return callback(null, db)
        }
        if (type === 'doc') {
          doc = new Doc(config)
          return callback(null, doc)
        }
      }
    })
  }
}

module.exports = {
  db: getDynamo.bind({}, 'db'),
  doc: getDynamo.bind({}, 'doc'),
}
