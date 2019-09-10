let binaryTypes = require('./helpers/binary-types')

module.exports = function responseFormatter(req, params) {
  let isError = params instanceof Error // Doesn't really pertain to async
  let buffer
  let bodyIsBuffer = params.body instanceof Buffer
  if (bodyIsBuffer) buffer = params.body // Back up buffer
  if (!isError) params = JSON.parse(JSON.stringify(params)) // Deep copy to aid testing mutation
  if (bodyIsBuffer) params.body = buffer // Restore non-JSON-encoded buffer

  /**
   * Response defaults
   *   where possible, normalize headers to pascal-kebab case (lolsigh)
   */
  // Body
  let body = params.body || '\n'

  // Headers: Cache-Control
  let cacheControl = params.cacheControl ||
                     params.headers && params.headers['Cache-Control'] ||
                     params.headers && params.headers['cache-control'] || ''
  if (params.headers && params.headers['cache-control'])
    delete params.headers['cache-control'] // Clean up improper casing

  // Headers: Content-Type
  let type = params.type ||
             params.headers && params.headers['Content-Type'] ||
             params.headers && params.headers['content-type'] ||
             'application/json; charset=utf8'
  if (params.headers && params.headers['content-type'])
    delete params.headers['content-type'] // Clean up improper casing

  // Cross-origin ritual sacrifice
  let cors = params.cors

  // Status
  let providedStatus = params.status || params.code || params.statusCode
  let status = providedStatus || 200

  // shorthand overrides
  if (isError) {
    status = providedStatus || 500
    type = 'text/html; charset=utf8'
    body = `
      <h1>${params.name} ${status}</h1>
      <h3>${params.message}</h3>
      <pre>${params.stack}<pre>
    `
  }

  if (params.html) {
    type = 'text/html; charset=utf8'
    body = params.html
  }
  else if (params.css) {
    type = 'text/css; charset=utf8'
    body = params.css
  }
  else if (params.js) {
    type = 'text/javascript; charset=utf8'
    body = params.js
  }
  else if (params.text) {
    type = 'text/plain; charset=utf8'
    body = params.text
  }
  else if (params.json) {
    type = 'application/json; charset=utf8'
    body = JSON.stringify(params.json)
  }
  else if (params.xml) {
    type = 'application/xml; charset=utf8'
    body = params.xml
  }

  let res = {
    headers: Object.assign({}, {'Content-Type': type}, params.headers || {}),
    statusCode: status,
    body
  }

  /**
   * Only send res.type for non-proxy responses in Arc 5; attributes of each env:
   * Arc 6:
   * - ARC_CLOUDFORMATION
   * - ARC_HTTP === 'aws_proxy'
   * Arc 5:
   * - !ARC_CLOUDFORMATION
   * - !ARC_HTTP || ARC_HTTP === 'aws'
   * Sandbox:
   * - !ARC_CLOUDFORMATION
   * - !ARC_HTTP
   */
  let notArcSix = !process.env.ARC_CLOUDFORMATION
  let notArcProxy = !process.env.ARC_HTTP || process.env.ARC_HTTP === 'aws'
  let isArcFive = notArcSix && notArcProxy
  let notProxyReq = !req.resource || req.resource && req.resource !== '/{proxy+}'
  if (isArcFive && notProxyReq) {
    // Fixes backwards compatibility: Arc vtl needs this param
    res.type = type
  }

  // Set and/or update headers
  let headers = res.headers
  if (cacheControl) headers['Cache-Control'] = cacheControl
  let antiCache = type.includes('text/html') ||
                  type.includes('application/json')
  if (headers && !headers['Cache-Control'] && antiCache) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
  }
  else if (headers && !headers['Cache-Control']) {
    headers['Cache-Control'] = 'max-age=86400' // Default cache to one day unless otherwise specified
  }
  if (cors) headers['Access-Control-Allow-Origin'] = '*'
  if (params.isBase64Encoded) res.isBase64Encoded = true
  if (params.location) {
    res.statusCode = providedStatus || 302
    res.headers.Location = params.location
  }

  // Handle body encoding (if necessary)
  let isBinary = binaryTypes.some(t => res.headers['Content-Type'].includes(t))
  let bodyIsString = typeof res.body === 'string'
  let b64enc = i => new Buffer.from(i).toString('base64')
  // Encode (and flag) outbound buffers
  if (bodyIsBuffer) {
    res.body = b64enc(res.body)
    res.isBase64Encoded = true
  }
  // Body is likely base64 & has binary MIME type, so flag it
  if (bodyIsString && isBinary) res.isBase64Encoded = true

  return res
}
