var serialize = require('serialize-error')
var html = require('./_err-tmpl')
var statusCodes = require('./validate/_status-codes')

module.exports = function _err(type, callback, err) {

  // setup a json payload for api gateway
  var exception = {
    statusCode: 500
  }

  // if the thrown error has code, status or statusCode of 400, 403, 404, 406, 409, 415, or 500 use it
  var hasCode = err.code && Number.isInteger(err.code) && statusCodes.includes(err.code)
  var hasStatus = err.status && Number.isInteger(err.status) && statusCodes.includes(err.status)
  var hasStatusCode = err.statusCode && Number.isInteger(err.statusCode) && statusCodes.includes(err.statusCode)

  if (hasCode) {
    exception.statusCode = err.code
  }

  if (hasStatus) {
    exception.statusCode = err.status
  }

  if (hasStatusCode) {
    exception.statusCode = err.statusCode
  }

  if (type === 'text/html') {
    exception.html = html(err)
  }
  else {
    exception.json = serialize(err)
  }

  callback(JSON.stringify(exception))
}
