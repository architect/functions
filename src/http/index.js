var csrf = require('./html/_csrf')
var htmlRequest = require('./html/_request')
var jsonRequest = require('./json/_request')

module.exports = {
  html: {
    csrf,
    get: htmlRequest,
    post: htmlRequest,
  },
  json: {
    get: jsonRequest,
    post: jsonRequest,
  },
}
