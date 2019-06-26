let aws = require('aws-sdk')
let https = require('https')
let http = require('http')

// ensure NODE_ENV
if (typeof process.env.NODE_ENV === 'undefined') {
  process.env.NODE_ENV = 'testing'
}
let client = https
if (process.env.NODE_ENV === 'testing')
  client = http

// override http agent
let agent = new client.Agent({
  keepAlive: true,
  maxSockets: 50,
  rejectUnauthorized: true,
})
aws.config.update({
   httpOptions: {agent}
})

// get a ref to the db
let DB = aws.DynamoDB
let endpoint = new aws.Endpoint('http://localhost:5000')
let testing = process.env.NODE_ENV === 'testing'

if (testing) {
  aws.config.update({
    region: 'us-west-1'
  })
}

/**
 * NOTE: this file is in the root so devs can cleanly opt into the fastest low level clients
 */
module.exports = testing? new DB({endpoint}) : new DB
