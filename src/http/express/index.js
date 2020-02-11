const aws = require('aws-serverless-express')
const fmt = require('./fmt')

module.export = function unexpress(app) {
  let server = aws.createServer(app)
  return function http(event, context, callback) { 
    let request = fmt(event)
    return aws.proxy(server, request, context, 'CALLBACK', callback)
  }
}
