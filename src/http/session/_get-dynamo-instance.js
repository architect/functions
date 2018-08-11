let aws = require('aws-sdk')
let testing = process.env.NODE_ENV === 'testing'
let endpoint = new aws.Endpoint('http://localhost:5000')
let region = 'us-west-1'

module.exports = testing? new aws.DynamoDB({endpoint, region}) : new aws.DynamoDB
