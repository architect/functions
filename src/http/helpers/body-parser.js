let qs = require('querystring')

/**
 * Arc 6 bodies are always base64 encoded strings with req.isBase64Encoded = true (or null, which we interpolate into `{}`)
 * <Arc 6 bodies are always objects
 */
module.exports = function parseBody (req) {
  if (!req.body || !req.headers || !Object.getOwnPropertyNames(req.body).length) return req.body
  else {
    // Paranoid deep copy
    let request = JSON.parse(JSON.stringify(req))
    // Predicates
    let isString = typeof request.body === 'string'
    let isBase64 = request.isBase64Encoded
    let shouldParse = isString && isBase64
    // Content types
    let contentType = type => request.headers && request.headers['Content-Type'].includes(type)
    let isJson = contentType('application/json') && shouldParse
    let isFormURLEncoded = contentType('application/x-www-form-urlencoded') && shouldParse
    let isMultiPartFormData = contentType('multipart/form-data') && shouldParse
    let isOctetStream = contentType('application/octet-stream') && shouldParse

    if (isJson) {
      try {
        // Handles base64 + JSON-encoded payloads (>Arc 6)
        let data = new Buffer.from(request.body, 'base64').toString()
        request.body = JSON.parse(data) || {}
      }
      catch(e) {
        throw Error('Invalid request body encoding or invalid JSON')
      }
    }

    else if (isFormURLEncoded) {
      let data = new Buffer.from(request.body, 'base64').toString()
      request.body = qs.parse(data)
    }

    else if (isMultiPartFormData || isOctetStream) {
      request.body = request.body.base64
        ? request.body
        : {base64: request.body}
    }

    // TODO maybe?
    // - text/plain
    // - application/xml

    return request.body
  }
}
