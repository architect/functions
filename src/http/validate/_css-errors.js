let err = require('@smallwins/err')
let isPlainObject = require('is-plain-object')
let statusCodes = require('./_status-codes')

class InvalidCssResponseError extends err.InternalError {}

module.exports = function checkForCssErrors(cmds) {

  // ensure res invoked with a plain object
  var invalidResponse = !isPlainObject(cmds)
  if (invalidResponse) {
    throw new InvalidCssResponseError(`res was not invoked with a plain object`)
  }

  // ensure only valid command keys
  var allowed = [
    'location',
    'session',
    'css',
    'status'
  ]
  var badKeys = []
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      badKeys.push(k)
    }
  })
  if (badKeys.length > 0) {
    throw new InvalidCssResponseError(`res invoked with invalid keys
got: ${badKeys.join(', ')}
allowed: ${allowed.join(', ')}
    `)
  }

  // ensure valid urls
  var badUrl = cmds.location && /^(\/)|(http)/.test(cmds.location) === false
  if (badUrl) {
    throw new InvalidCssResponseError(`invalid location value: ${cmds.location} is not a valid URL`)
  }

  // ensure status only one of 400, 403, 404, 406, 409, 415, or 500
  var badStatus = cmds.status && statusCodes.includes(cmds.status) === false
  if (badStatus) {
    throw new InvalidCssResponseError(`invalid status value: ${cmds.status}\n\nMust be one of: ${statusCodes.join(', ')}`)
  }

  // ensure not both location and Css
  var hasLocationAndCss = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('css')
  if (hasLocationAndCss) {
    throw new InvalidCssResponseError('`res` invoked with `location` and `css` keys: only one is allowed')
  }

  // ensure one of location or Css
  var hasOneOfLocationOrCss = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('css')
  if (!hasOneOfLocationOrCss) {
    throw new InvalidCssResponseError('`res` must be invoked with either `location` or `css`')
  }
}
