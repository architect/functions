let httpError = require('./errors')
let binaryTypes = require('./helpers/binary-types')

module.exports = function responseFormatter (req, params) {
  let isError = params instanceof Error

  // Handle HTTP API v2.0 payload scenarios, which have some very strange edges
  if (req.version && req.version === '2.0') {
    // New school AWS
    let knownParams = [ 'statusCode', 'body', 'headers', 'isBase64Encoded', 'cookies' ]
    let hasKnownParams = p => knownParams.some(k => k === p)
    // Old school Arc
    let tidyParams = [ 'code', 'cookie', 'cors', 'location', 'session', 'status' ]
    let hasTidyParams = p => tidyParams.some(k => k === p)
    // Older school Arc
    let staticallyBound = [ 'html', 'css', 'js', 'text', 'json', 'xml' ]
    let isStaticallyBound = p => staticallyBound.some(k => k === p)

    let is = t => typeof params === t
    let keys = (params && is('object') && Object.keys(params)) || []

    // Handle scenarios where we have a known parameter returned
    if (is('object') &&
        !Array.isArray(params) &&
        (keys.some(hasKnownParams) ||
         keys.some(hasTidyParams) ||
         keys.some(isStaticallyBound))) {
      /* noop */
    }

    else if (isError) {
      /* noop */
    }

    // Handle scenarios where arbitrary stuff is returned to be JSONified
    else if (is('object') ||
             is('number') ||
             (is('string') && params.length) ||
             Array.isArray(params) ||
             params instanceof Buffer) {
      params = { body: JSON.stringify(params) }
    }

    // Not returning is actually valid now lolnothingmatters
    else if (!params) {
      params = {}
    }
  }

  let buffer
  let bodyIsBuffer = params.body && params.body instanceof Buffer
  if (bodyIsBuffer) buffer = params.body // Back up buffer
  if (!isError) params = JSON.parse(JSON.stringify(params)) // Deep copy to aid testing mutation
  if (bodyIsBuffer) params.body = buffer // Restore non-JSON-encoded buffer

  /**
   * Response defaults
   *   where possible, normalize headers to pascal-kebab case (lolsigh)
   */
  // Body
  let body = params.body || ''

  // Headers: cache-control
  let cacheControl = params.cacheControl ||
                     params.headers && params.headers['cache-control'] ||
                     params.headers && params.headers['Cache-Control'] || ''
  if (params.headers && params.headers['Cache-Control']) {
    delete params.headers['Cache-Control'] // Clean up improper casing
  }

  // Headers: content-type
  let type = params.type ||
             params.headers && params.headers['content-type'] ||
             params.headers && params.headers['Content-Type'] ||
             'application/json; charset=utf8'
  if (params.headers && params.headers['Content-Type']) {
    delete params.headers['Content-Type'] // Clean up improper casing
  }

  // Cross-origin ritual sacrifice
  let cors = params.cors

  // Old school convenience response params
  // As of Functions v4 we will keep these around for all eternity
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

  // Status
  let providedStatus = params.status || params.code || params.statusCode
  let statusCode = providedStatus || 200

  let res = {
    headers: Object.assign({}, { 'content-type': type }, params.headers || {}),
    statusCode,
    body
  }

  // REST API stuff
  if (params.multiValueHeaders) {
    res.multiValueHeaders = params.multiValueHeaders
  }
  // HTTP API stuff
  if (params.cookies) {
    res.cookies = params.cookies
  }

  // Error override
  if (isError) {
    let statusCode = providedStatus || 500
    let title = params.name
    let message = `
      ${params.message}<br>
      <pre>${params.stack}<pre>
    `
    res = httpError({ statusCode, title, message })
  }

  // Set and/or update headers
  let headers = res.headers
  if (cacheControl) headers['cache-control'] = cacheControl
  let antiCache = type.includes('text/html') ||
                  type.includes('application/json') ||
                  type.includes('application/vnd.api+json')
  if (headers && !headers['cache-control'] && antiCache) {
    headers['cache-control'] = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
  }
  else if (headers && !headers['cache-control']) {
    headers['cache-control'] = 'max-age=86400' // Default cache to one day unless otherwise specified
  }
  if (cors) headers['access-control-allow-origin'] = '*'
  if (params.isBase64Encoded) res.isBase64Encoded = true
  if (params.location) {
    res.statusCode = providedStatus || 302
    res.headers.Location = params.location
  }

  // Handle body encoding (if necessary)
  let isBinary = binaryTypes.some(t => res.headers['content-type'].includes(t))
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
