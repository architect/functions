let err = require('@smallwins/err')
let isPlainObject = require('is-plain-object')
let statusCodes = require('./_status-codes')

class InvalidJsResponseError extends err.InternalError {}

module.exports = function checkForJsErrors(cmds) {

  // ensure res invoked with a plain object
  var invalidResponse = !isPlainObject(cmds)
  if (invalidResponse) {
    throw new InvalidJsResponseError(`res was not invoked with a plain object`)
  }

  // ensure only valid command keys
  var allowed = [
    'location',
    'session',
    'js',
    'status'
  ]
  var badKeys = []
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      badKeys.push(k)
    }
  })
  if (badKeys.length > 0) {
    throw new InvalidJsResponseError(`res invoked with invalid keys
got: ${badKeys.join(', ')}
allowed: ${allowed.join(', ')}
    `)
  }

  // ensure valid urls
  var badUrl = cmds.location && /^(\/)|(http)/.test(cmds.location) === false
  if (badUrl) {
    throw new InvalidJsResponseError(`invalid location value: ${cmds.location} is not a valid URL`)
  }

  // ensure status only one of 403, 404 or 500
  var badStatus = cmds.status && statusCodes.includes(cmds.status) === false
  if (badStatus) {
    throw new InvalidJsResponseError(`invalid status value: ${cmds.status}\n\nMust be one of: ${statusCodes.join(', ')}`)
  }

  // ensure not both location and Js
  var hasLocationAndJs = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('js')
  if (hasLocationAndJs) {
    throw new InvalidJsResponseError('`res` invoked with `location` and `js` keys: only one is allowed')
  }

  // ensure one of location or Js
  var hasOneOfLocationOrJs = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('js')
  if (!hasOneOfLocationOrJs) {
    throw new InvalidJsResponseError('`res` must be invoked with either `location` or `js`')
  }
}
