let qs = require('querystring')

/**
 * Arc 6 bodies are always base64 encoded strings with req.isBase64Encoded = true (or null, which we interpolate into `{}`)
 * <Arc 6 bodies are always objects
 */
module.exports = function parseBody (req) {
  let ctype = req.headers['Content-Type'] || req.headers['content-type']
  let passthru = !req.body || !req.headers || !ctype || !Object.getOwnPropertyNames(req.body).length
  if (passthru) {
    return req.body
  }
  else {
    // Paranoid but necessary deep copy
    let request = JSON.parse(JSON.stringify(req))
    let headers = request.headers
    let contentType = type => headers && headers['Content-Type'] && headers['Content-Type'].includes(type) || headers && headers['content-type'] && headers['content-type'].includes(type)

    let isString = typeof request.body === 'string'
    let isBase64 = request.isBase64Encoded
    let isParsing = isString && isBase64
    let isJSON = contentType('application/json')
    let isFormURLEncoded = contentType('application/x-www-form-urlencoded')
    let isMultiPartFormData = contentType('multipart/form-data') && isParsing
    let isOctetStream = contentType('application/octet-stream') && isParsing

    if (isJSON) {
      try {
        // Handles JSON-serialized payloads in Arc 6+ (what used to be done in Arc VTL)
        request.body = JSON.parse(request.body) || {}
      }
      catch(e) {
        throw Error('Invalid request body encoding or invalid JSON')
      }
    }

    if (isFormURLEncoded) {
      request.body = qs.parse(request.body)
    }

    if (isMultiPartFormData || isOctetStream) {
      request.body = request.body.base64
        ? request.body
        : {base64: request.body}
    }

    return request.body
  }
}
