let qs = require('querystring')

/**
 * Arc 6 bodies are always base64 encoded strings with req.isBase64Encoded = true (or null, which we interpolate into `{}`)
 * <Arc 6 bodies are always objects
 */
module.exports = function parseBody (req) {
  let ctype = req.headers['content-type'] || req.headers['Content-Type']
  let passthru = !req.body || !req.headers || !ctype || (typeof req.body !== 'string' && !Object.keys(req.body).length)
  if (passthru) {
    return req.body
  }
  else {
    // Paranoid deep copy
    let request = JSON.parse(JSON.stringify(req))
    let headers = request.headers
    // Note: content-type header may have multiple, comma-separated values. matching w/ includes may match to multiple different types
    let contentType = type => headers?.['content-type']?.includes(type) || headers?.['Content-Type']?.includes(type)

    let isString = typeof request.body === 'string'
    let isBase64 = request.isBase64Encoded
    let isParsing = isString && isBase64
    let isJSON = (contentType('application/json') || contentType('application/vnd.api+json')) && isString
    let isFormURLEncoded = contentType('application/x-www-form-urlencoded') && isParsing
    let isMultiPartFormData = contentType('multipart/form-data') && isParsing
    let isOctetStream = contentType('application/octet-stream') && isParsing
    let isPlainText = contentType('text/plain') && isParsing
    let isXml = (contentType('text/xml') || contentType('application/xml')) && isParsing

    if (isJSON) {
      try {
        let data = isBase64
          // Base64 + JSON-encoded payloads (>Arc 6 REST)
          ? Buffer.from(request.body, 'base64').toString()
          // Raw JSON (HTTP API + Lambda v2.0 payload)
          : request.body
        request.body = JSON.parse(data) || {}
      }
      catch {
        throw Error('Invalid request body encoding or invalid JSON')
      }
    }
    else if (isPlainText || isXml) {
      request.body = new Buffer.from(request.body, 'base64').toString()
    }
    else if (isFormURLEncoded) {
      let data = new Buffer.from(request.body, 'base64').toString()
      request.body = qs.parse(data)
    }
    else if (isMultiPartFormData || isOctetStream) {
      request.body = request.body.base64
        ? request.body
        : { base64: request.body }
    }

    return request.body
  }
}
