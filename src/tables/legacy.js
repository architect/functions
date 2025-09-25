const { isNode18, useAWS } = require('../lib')

const client = {}

/**
 * Instantiates legacy AWS SDK DynamoDB service interfaces
 */
module.exports = function getLegacyDynamoClients({ port, region }) {
  if (client.db && client.doc) return client

  let DB
  let Doc

  if (isNode18) {
    const dynamo = require('@aws-sdk/client-dynamodb')

    const docclient = require('@aws-sdk/lib-dynamodb')
    DB = dynamo.DynamoDB
    Doc = docclient.DynamoDBDocument
  } else {
    const dynamo = require('aws-sdk/clients/dynamodb')
    DB = dynamo
    Doc = dynamo.DocumentClient
  }

  if (useAWS()) {
    let config
    // SDK v2 (Node <=16) does not have keep-alive enabled by default, whereas v3 (>=18) does
    if (!isNode18) {
      const https = require('node:https')
      config = {
        httpOptions: {
          agent: new https.Agent({
            keepAlive: true,
            maxSockets: 50, // Node can set to Infinity; AWS maxes at 50
            rejectUnauthorized: true,
          }),
        },
      }
    }
    client.db = new DB(config)
    client.doc = isNode18 ? Doc.from(client.db) : new Doc(config)
    return client
  }
  const config = {
    endpoint: `http://localhost:${port}`,
    region,
  }
  if (isNode18) {
    // Disable keep-alive locally (or wait Node's default 5s for sockets to time out)
    const http = require('node:http')

    const { NodeHttpHandler } = require('@smithy/node-http-handler')
    config.requestHandler = new NodeHttpHandler({
      httpAgent: new http.Agent({ keepAlive: false }),
    })
  }
  client.db = new DB(config)
  client.doc = isNode18 ? Doc.from(client.db) : new Doc(config)
  return client
}
