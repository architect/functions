let err = require('@smallwins/err')
let isPlainObject = require('is-plain-object')
let statusCodes = require('./_status-codes')

class InvalidTextResponseError extends err.InternalError {}

module.exports = function checkForTextErrors(cmds) {

  // ensure res invoked with a plain object
  var invalidResponse = !isPlainObject(cmds)
  if (invalidResponse) {
    throw new InvalidTextResponseError(`res was not invoked with a plain object`)
  }

  // ensure only valid command keys
  var allowed = [
    'location',
    'session',
    'text',
    'status'
  ]
  var badKeys = []
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      badKeys.push(k)
    }
  })
  if (badKeys.length > 0) {
    throw new InvalidTextResponseError(`res invoked with invalid keys
got: ${badKeys.join(', ')}
allowed: ${allowed.join(', ')}
    `)
  }

  // ensure valid urls
  var badUrl = cmds.location && /^(\/)|(http)/.test(cmds.location) === false
  if (badUrl) {
    throw new InvalidTextResponseError(`invalid location value: ${cmds.location} is not a valid URL`)
  }

  // ensure status only one of 403, 404 or 500
  var badStatus = cmds.status && statusCodes.includes(cmds.status) === false
  if (badStatus) {
    throw new InvalidTextResponseError(`invalid status value: ${cmds.status}\n\nMust be one of: ${statusCodes.join(', ')}`)
  }

  // ensure not both location and Text
  var hasLocationAndText = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('text')
  if (hasLocationAndText) {
    throw new InvalidTextResponseError('`res` invoked with `location` and `text` keys: only one is allowed')
  }

  // ensure one of location or Text
  var hasOneOfLocationOrText = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('text')
  if (!hasOneOfLocationOrText) {
    throw new InvalidTextResponseError('`res` must be invoked with either `location` or `text`')
  }
}
