let err = require('@smallwins/err')
let isPlainObject = require('is-plain-object')
let statusCodes = require('./_status-codes')

class InvalidXmlResponseError extends err.InternalError {}

module.exports = function checkForHtmlErrors(cmds) {

  // ensure res invoked with a plain object
  var invalidResponse = !isPlainObject(cmds)
  if (invalidResponse) {
    throw new InvalidXmlResponseError(`res was not invoked with a plain object`)
  }

  // ensure only valid command keys
  var allowed = [
    'location',
    'session',
    'xml',
    'status'
  ]
  var badKeys = []
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      badKeys.push(k)
    }
  })
  if (badKeys.length > 0) {
    throw new InvalidXmlResponseError(`res invoked with invalid keys
got: ${badKeys.join(', ')}
allowed: ${allowed.join(', ')}
    `)
  }

  // ensure valid urls
  var badUrl = cmds.location && /^(\/)|(http)/.test(cmds.location) === false
  if (badUrl) {
    throw new InvalidXmlResponseError(`invalid location value: ${cmds.location} is not a valid URL`)
  }

  // ensure status only one of 400, 403, 404, 406, 409, 415, or 500
  var badStatus = cmds.status && statusCodes.includes(cmds.status) === false
  if (badStatus) {
    throw new InvalidXmlResponseError(`invalid status value: ${cmds.status}\n\nMust be one of: ${statusCodes.join(', ')}`)
  }

  // ensure not both location and xml
  var hasLocationAndXml = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('xml')
  if (hasLocationAndXml) {
    throw new InvalidXmlResponseError('`res` invoked with `location` and `xml` keys: only one is allowed')
  }

  // ensure one of location or xml
  var hasOneOfLocationOrXml = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('xml')
  if (!hasOneOfLocationOrXml) {
    throw new InvalidXmlResponseError('`res` must be invoked with either `location` or `xml`')
  }
}
