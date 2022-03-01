let https = require('https')
let getPorts = require('../lib/get-ports')
let db, doc

/**
 * Instantiates Dynamo service interfaces
 */
function getDynamo (type, callback) {
  if (!type) throw ReferenceError('Must supply Dynamo service interface type')

  // We really only want to load aws-sdk if absolutely necessary
  // eslint-disable-next-line
  let dynamo = require('aws-sdk/clients/dynamodb')

  let { ARC_ENV, ARC_LOCAL, AWS_REGION } = process.env
  let local = ARC_ENV === 'testing' || ARC_LOCAL
  let DB = dynamo
  let Doc = dynamo.DocumentClient

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
