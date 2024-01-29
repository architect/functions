let { isNode18, useAWS } = require('../lib')

let client = {}

/**
 * Instantiates legacy AWS SDK DynamoDB service interfaces
 */
module.exports = function getLegacyDynamoClients ({ port, region }) {

  if (client.db && client.doc) return client

  let DB, Doc

  if (isNode18) {
    // eslint-disable-next-line
    let dynamo = require('@aws-sdk/client-dynamodb')
    // eslint-disable-next-line
    let docclient = require('@aws-sdk/lib-dynamodb')
    DB = dynamo.DynamoDB
    Doc = docclient.DynamoDBDocument
  }
  else {
    // eslint-disable-next-line
    let dynamo = require('aws-sdk/clients/dynamodb')
    DB = dynamo
    Doc = dynamo.DocumentClient
  }

  if (useAWS()) {
    let config
    // SDK v2 (Node <=16) does not have keep-alive enabled by default, whereas v3 (>=18) does
    if (!isNode18) {
      let https = require('https')
      config = {
        httpOptions: {
          agent: new https.Agent({
            keepAlive: true,
            maxSockets: 50, // Node can set to Infinity; AWS maxes at 50
            rejectUnauthorized: true,
          })
        }
      }
    }
    client.db = new DB(config)
    client.doc = isNode18 ? Doc.from(client.db) : new Doc(config)
    return client
  }
  else {
    let config = {
      endpoint: `http://localhost:${port}`,
      region,
    }
    if (isNode18) {
      // Disable keep-alive locally (or wait Node's default 5s for sockets to time out)
      let http = require('http')
      // eslint-disable-next-line
      let { NodeHttpHandler } = require('@smithy/node-http-handler')
      config.requestHandler = new NodeHttpHandler({
        httpAgent: new http.Agent({ keepAlive: false })
      })
    }
    client.db = new DB(config)
    client.doc = isNode18 ? Doc.from(client.db) : new Doc(config)
    return client
  }
}
