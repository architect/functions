let dynamo = require('@aws-sdk/client-dynamodb')
let docclient = require('@aws-sdk/lib-dynamodb')
let https = require('https')
let getPorts = require('../_get-ports')
let db, doc

/**
 * Instantiates Dynamo service interfaces
 */
function getDynamo (type, callback) {
  if (!type)
    throw ReferenceError('Must supply Dynamo service interface type')
  let { ARC_ENV, ARC_LOCAL, AWS_REGION } = process.env
  let local = ARC_ENV === 'testing' || ARC_LOCAL
  let DB = dynamo.DynamoDB
  let Doc = docclient.DynamoDBDocument

  if (db && type === 'db') {
    return callback(null, db)
  }

  if (doc && type === 'doc') {
    return callback(null, doc)
  }

  if (!local) {
    let agent = new https.Agent({
      keepAlive: true,
      maxSockets: 50, // Node can set to Infinity; AWS maxes at 50; check back on this every once in a while
      rejectUnauthorized: true,
    })
    // TODO? migrate to using `AWS_NODEJS_CONNECTION_REUSE_ENABLED`?
    let config = {
      httpOptions: { agent }
    }

    db = new DB(config)
    doc = Doc.from(db)
    return callback(null, type === 'db' ? db : doc)
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
        db = new DB(config)
        doc = Doc.from(db)
        return callback(null, type === 'db' ? db : doc)
      }
    })
  }
}

module.exports = {
  doc: getDynamo.bind({}, 'doc'),
  db: getDynamo.bind({}, 'db'),
}
