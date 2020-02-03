let aws = require('aws-sdk')
let https = require('https')
let DB = aws.DynamoDB
let port = process.env.ARC_TABLES_PORT || 5000
let endpoint = new aws.Endpoint(`http://localhost:${port}`)

if (typeof process.env.NODE_ENV === 'undefined')
  process.env.NODE_ENV = 'testing'

let testing = process.env.NODE_ENV === 'testing'

if (!testing) {
  let agent = new https.Agent({
    keepAlive: true,
    maxSockets: 50,
    rejectUnauthorized: true,
  })
  aws.config.update({
    httpOptions: {agent}
  })
}

module.exports = testing? new DB({endpoint}) : new DB
