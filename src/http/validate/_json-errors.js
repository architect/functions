let err = require('@smallwins/err')
let isPlainObject = require('is-plain-object')
let statusCodes = require('./_status-codes')

class InvalidJsonResponseError extends err.InternalError {}

module.exports = function checkForHtmlErrors(cmds) {

  // ensure res invoked with a plain object
  var invalidResponse = !isPlainObject(cmds)
  if (invalidResponse) {
    throw new InvalidJsonResponseError(`res was not invoked with a plain object`)
  }

  // ensure only valid command keys
  var allowed = [
    'location',
    'session',
    'json',
    'status'
  ]
  var badKeys = []
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      badKeys.push(k)
    }
  })
  if (badKeys.length > 0) {
    throw new InvalidJsonResponseError(`res invoked with invalid keys
got: ${badKeys.join(', ')}
allowed: ${allowed.join(', ')}
    `)
  }

  // ensure valid urls
  var badUrl = cmds.location && /^(\/)|(http)/.test(cmds.location) === false
  if (badUrl) {
    throw new InvalidJsonResponseError(`invalid location value: ${cmds.location} is not a valid URL`)
  }

  // ensure status only one of 400, 403, 404, 406, 409, 415, or 500
  var badStatus = cmds.status && statusCodes.includes(cmds.status) === false
  if (badStatus) {
    throw new InvalidJsonResponseError(`invalid status value: ${cmds.status}\n\nMust be one of: ${statusCodes.join(', ')}`)
  }

  // ensure not both location and html
  var hasLocationAndJson = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('json')
  if (hasLocationAndJson) {
    throw new InvalidJsonResponseError('`res` invoked with `location` and `json` keys: only one is allowed')
  }

  // ensure one of location or html
  var hasOneOfLocationOrJson = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('json')
  if (!hasOneOfLocationOrJson) {
    throw new InvalidJsonResponseError('`res` must be invoked with either `location` or `json`')
  }
}
