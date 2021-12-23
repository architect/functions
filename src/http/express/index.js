const aws = require('aws-serverless-express')

module.exports = function unexpress (app) {
  let server = aws.createServer(app)
  return function http (event, context, callback) {
    if (process.env.ARC_ENV === 'testing' || process.env.ARC_LOCAL) {
      return aws.proxy(server, event, context, 'CALLBACK', callback)
    }
    else {
      return aws.proxy(server, event, context)
    }
  }
}
