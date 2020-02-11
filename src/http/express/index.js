const aws = require('aws-serverless-express')
const fmt = require('./fmt')

module.exports = function unexpress(app) {
  let server = aws.createServer(app)
  return function http(event, context, callback) {
    let request = fmt(event)
    if (process.env.NODE_ENV === 'testing' || process.env.ARC_LOCAL)
      return aws.proxy(server, request, context, 'CALLBACK', callback)
    return aws.proxy(server, request, context)
  }
}
