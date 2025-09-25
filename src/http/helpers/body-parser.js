const qs = require('node:querystring')

/**
 * Arc 6 bodies are always base64 encoded strings with req.isBase64Encoded = true (or null, which we interpolate into `{}`)
 * <Arc 6 bodies are always objects
 */
module.exports = function parseBody(req) {
  const ctype = req.headers['content-type'] || req.headers['Content-Type']
  const passthru =
    !req.body || !req.headers || !ctype || (typeof req.body !== 'string' && !Object.keys(req.body).length)
  if (passthru) {
    return req.body
  }
  // Paranoid deep copy
  const request = JSON.parse(JSON.stringify(req))
  const headers = request.headers
  // Note: content-type header may have multiple, comma-separated values. matching w/ includes may match to multiple different types
  const contentType = (type) => headers?.['content-type']?.includes(type) || headers?.['Content-Type']?.includes(type)

  const isString = typeof request.body === 'string'
  const isBase64 = request.isBase64Encoded
  const isParsing = isString && isBase64
  const isJSON = (contentType('application/json') || contentType('application/vnd.api+json')) && isString
  const isFormURLEncoded = contentType('application/x-www-form-urlencoded') && isParsing
  const isMultiPartFormData = contentType('multipart/form-data') && isParsing
  const isOctetStream = contentType('application/octet-stream') && isParsing
  const isPlainText = contentType('text/plain') && isParsing
  const isXml = (contentType('text/xml') || contentType('application/xml')) && isParsing

  if (isJSON) {
    try {
      const data = isBase64
        ? // Base64 + JSON-encoded payloads (>Arc 6 REST)
          Buffer.from(request.body, 'base64').toString()
        : // Raw JSON (HTTP API + Lambda v2.0 payload)
          request.body
      request.body = JSON.parse(data) || {}
    } catch {
      throw Error('Invalid request body encoding or invalid JSON')
    }
  } else if (isPlainText || isXml) {
    request.body = new Buffer.from(request.body, 'base64').toString()
  } else if (isFormURLEncoded) {
    const data = new Buffer.from(request.body, 'base64').toString()
    request.body = qs.parse(data)
  } else if (isMultiPartFormData || isOctetStream) {
    request.body = request.body.base64 ? request.body : { base64: request.body }
  }

  return request.body
}
