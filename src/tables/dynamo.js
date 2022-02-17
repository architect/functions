let https = require('https')
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
  let aws = require('aws-sdk')

  // We might normally like to throw if `local && !port`, but this is also a direct DynamoDB interface in global scope
  // Thus, this path instantiates even if the project doesn't have tables
  let {
    ARC_ENV,
    ARC_LOCAL,
    AWS_REGION,
    ARC_SANDBOX,
  } = process.env
  let local = ARC_ENV === 'testing' || ARC_LOCAL
  let DB = aws.DynamoDB
  let Doc = aws.DynamoDB.DocumentClient
  let localConfig

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
    aws.config.update({
      httpOptions: { agent }
    })
    // TODO? migrate to using `AWS_NODEJS_CONNECTION_REUSE_ENABLED`?
  }
  else {
    // Ideally we would check the validity of the port, but since this is initiated in global scope we can't necessarily rely on `ports.tables` (which is only added by Sandbox if `inv.tables`)
    let { ports } = JSON.parse(ARC_SANDBOX)
    let port = ports.tables
    localConfig = {
      endpoint: new aws.Endpoint(`http://localhost:${port}`),
      region: AWS_REGION || 'us-west-2' // Do not assume region is set!
    }
  }

  if (type === 'db') {
    db = local
      ? new DB(localConfig)
      : new DB
    return callback(null, db)
  }

  if (type === 'doc') {
    doc = local
      ? new Doc(localConfig)
      : new Doc
    return callback(null, doc)
  }
}

module.exports = {
  db: getDynamo.bind({}, 'db'),
  doc: getDynamo.bind({}, 'doc'),
  session: getDynamo.bind({}, 'session'),
}
