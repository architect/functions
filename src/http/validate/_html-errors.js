var err = require('@smallwins/err')
var isPlainObject = require('is-plain-object')

class InvalidResponseError extends err.InternalError {}

module.exports = function checkForHtmlErrors(cmds) {

  // ensure res invoked with a plain object
  var invalidResponse = !isPlainObject(cmds)
  if (invalidResponse) {
    throw new InvalidResponseError(`res was not invoked with a plain object`)
  }

  // ensure only valid command keys
  var allowed = [
    'location',
    'session',
    'html',
    'status'
  ]
  var badKeys = []
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      badKeys.push(k)
    }
  })
  if (badKeys.length > 0) {
    throw new InvalidResponseError(`res invoked with invalid keys
got: ${badKeys.join(', ')}
allowed: ${allowed.join(', ')}
    `)
  }

  // ensure valid urls
  var badUrl = cmds.location && /^(\/)|(http)/.test(cmds.location) === false
  if (badUrl) {
    throw new InvalidResponseError(`invalid location value: ${cmds.location} is not a valid URL`)
  }

  // ensure status only one of 403, 404 or 500
  var badStatus = cmds.status && [403, 404, 500].includes(cmds.status) === false
  if (badStatus) {
    throw new InvalidResponseError(`invalid status value: ${cmds.status}\n\nMust be one of: 403, 404 or 500`)
  }

  // ensure not both location and html
  var hasLocationAndHtml = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('html')
  if (hasLocationAndHtml) {
    throw new InvalidResponseError('`res` invoked with `location` and `html` keys: only one is allowed')
  }

  // ensure one of location or html
  var hasOneOfLocationOrHtml = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('html')
  if (!hasOneOfLocationOrHtml) {
    throw new InvalidResponseError('`res` must be invoked with either `location` or `html`')
  }
}
