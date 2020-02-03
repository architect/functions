let aws = require('aws-sdk')
let https = require('https')
let Doc = aws.DynamoDB.DocumentClient
let port = process.env.ARC_TABLES_PORT || 5000
let endpoint = new aws.Endpoint(`http://localhost:${port}`)

/**
 * Region here is a temp fix until we shore up various AWS init paths in utils.initAWS
 */
if (!process.env.AWS_REGION)
  process.env.AWS_REGION = 'us-west-2'
let region = process.env.AWS_REGION || 'us-west-2'


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

module.exports = testing ? new Doc({endpoint, region}) /* TODO remove region */ : new Doc
