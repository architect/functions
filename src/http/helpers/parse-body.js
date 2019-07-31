let qs = require('querystring')

/**
 * Arc 6 bodies are always base64 encoded strings with req.isBase64Encoded = true (or null, which we interpolate into `{}`)
 * <Arc 6 bodies are always objects
 */
module.exports = function parseBody (req) {
  if (!req.body || !Object.getOwnPropertyNames(req.body).length) return req.body
  else {
    // Predicates
    let isString = typeof req.body === 'string'
    let isBase64 = req.isBase64Encoded
    let shouldParse = isString && isBase64
    // Content types
    let contentType = type => req.headers && req.headers['Content-Type'].includes(type)
    let isJson = contentType('application/json') && shouldParse
    let isFormURLEncoded = contentType('application/x-www-form-urlencoded') && shouldParse
    let isBinary = contentType('multipart/form-data') || contentType('application/octet-stream') && shouldParse

    if (isJson) {
      try {
        // Handles base64 + JSON-encoded payloads (>Arc 6)
        let data = new Buffer.from(req.body, 'base64').toString()
        req.body = JSON.parse(data) || {}
      }
      catch(e) {
        throw Error('Invalid request body encoding or invalid JSON')
      }
    }

    else if (isFormURLEncoded) {
      let data = new Buffer.from(req.body, 'base64').toString()
      req.body = qs.parse(data)
    }

    else if (isBinary) {
      req.body = req.body.base64
        ? req.body
        : {base64: req.body}
    }

    // TODO maybe?
    // - text/plain
    // - application/xml

    return req.body
  }
}