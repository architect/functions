const httpError = require('./errors')
const binaryTypes = require('./helpers/binary-types')
const { brotliCompressSync: br, gzipSync: gzip } = require('node:zlib')
const compressionTypes = { br, gzip }

module.exports = function responseFormatter(req, params) {
  const isError = params instanceof Error

  // Handle HTTP API v2.0 payload scenarios, which have some very strange edges
  if (req?.version === '2.0') {
    // New school AWS
    const knownParams = ['statusCode', 'body', 'headers', 'isBase64Encoded', 'cookies']
    const hasKnownParams = (p) => knownParams.some((k) => k === p)
    // Old school Arc
    const tidyParams = ['code', 'cookie', 'cors', 'location', 'session', 'status']
    const hasTidyParams = (p) => tidyParams.some((k) => k === p)
    // Older school Arc
    const staticallyBound = ['html', 'css', 'js', 'text', 'json', 'xml']
    const isStaticallyBound = (p) => staticallyBound.some((k) => k === p)

    // biome-ignore lint/suspicious/useValidTypeof: we know what we are doing here
    const is = (t) => typeof params === t
    const keys = (params && is('object') && Object.keys(params)) || []

    // Handle scenarios where we have a known parameter returned
    if (
      is('object') &&
      !Array.isArray(params) &&
      (keys.some(hasKnownParams) || keys.some(hasTidyParams) || keys.some(isStaticallyBound))
    ) {
      /* noop */
    } else if (isError) {
      /* noop */
    }

    // Handle scenarios where arbitrary stuff is returned to be JSONified
    else if (
      is('object') ||
      is('number') ||
      (is('string') && params.length) ||
      Array.isArray(params) ||
      params instanceof Buffer
    ) {
      params = { body: JSON.stringify(params) }
    }

    // Not returning is actually valid now lolnothingmatters
    else if (!params) {
      params = {}
    }
  }

  let buffer
  const bodyIsBuffer = params?.body instanceof Buffer
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
  const cacheControl =
    params.cacheControl || params.headers?.['cache-control'] || params.headers?.['Cache-Control'] || ''
  if (params.headers?.['Cache-Control']) {
    delete params.headers['Cache-Control'] // Clean up improper casing
  }

  // Headers: content-type
  let type =
    params.type ||
    params.headers?.['content-type'] ||
    params.headers?.['Content-Type'] ||
    'application/json; charset=utf8'
  if (params.headers?.['Content-Type']) {
    delete params.headers['Content-Type'] // Clean up improper casing
  }

  // Headers: content-encoding
  const encoding = params.headers?.['content-encoding'] || params.headers?.['Content-Encoding']
  if (params.headers?.['Content-Encoding']) {
    delete params.headers['Content-Encoding'] // Clean up improper casing
  }
  const acceptEncoding = req.headers?.['accept-encoding'] || req.headers?.['Accept-Encoding']

  // Cross-origin ritual sacrifice
  const cors = params.cors

  // Old school convenience response params
  // As of Functions v4 we will keep these around for all eternity
  if (params.html) {
    type = 'text/html; charset=utf8'
    body = params.html
  } else if (params.css) {
    type = 'text/css; charset=utf8'
    body = params.css
  } else if (params.js) {
    type = 'text/javascript; charset=utf8'
    body = params.js
  } else if (params.text) {
    type = 'text/plain; charset=utf8'
    body = params.text
  } else if (params.json) {
    type = 'application/json; charset=utf8'
    body = JSON.stringify(params.json)
  } else if (params.xml) {
    type = 'application/xml; charset=utf8'
    body = params.xml
  }

  // Status
  const providedStatus = params.status || params.code || params.statusCode
  const statusCode = providedStatus || 200

  let res = {
    headers: Object.assign({}, { 'content-type': type }, params.headers || {}),
    statusCode,
    body,
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
    const statusCode = providedStatus || 500
    const title = params.name
    const message = `
      ${params.message}<br>
      <pre>${params.stack}<pre>
    `
    res = httpError({ statusCode, title, message })
  }

  // Set and/or update headers
  const headers = res.headers
  if (cacheControl) headers['cache-control'] = cacheControl
  const antiCache =
    type.includes('text/html') ||
    type.includes('application/json') ||
    type.includes('application/vnd.api+json') ||
    params.location // Ensure CDNs don't cache location responses
  if (headers && !headers['cache-control'] && antiCache) {
    headers['cache-control'] = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
  } else if (headers && !headers['cache-control']) {
    headers['cache-control'] = 'max-age=86400' // Default cache to one day unless otherwise specified
  }
  if (cors) headers['access-control-allow-origin'] = '*'
  if (params.isBase64Encoded) res.isBase64Encoded = true
  if (params.location) {
    res.statusCode = providedStatus || 302
    res.headers.location = params.location
  }

  // Handle body encoding (if necessary)
  const [contentType] = (res.headers['content-type'] || '').split(';')
  const isBinary = binaryTypes.includes(contentType)
  const bodyIsString = typeof res.body === 'string'
  const b64enc = (i) => new Buffer.from(i).toString('base64')
  function compress(body, type) {
    res.headers['content-encoding'] = type
    return compressionTypes[type](body)
  }

  // Compress, encode, and flag buffer responses
  // Legacy API Gateway (REST, i.e. !req.version) and ASAP (which sets isBase64Encoded) handle their own compression, so don't double-compress / encode
  const shouldCompress =
    req.version && !params.isBase64Encoded && !encoding && acceptEncoding && params.compression !== false
  if (bodyIsBuffer) {
    const body = shouldCompress ? compress(res.body) : res.body
    res.body = b64enc(body)
    res.isBase64Encoded = true
  }
  // Body is likely already base64 encoded & has binary MIME type, so just flag it
  else if (bodyIsString && isBinary) {
    res.isBase64Encoded = true
  }
  // Compress, encode, and flag string responses
  else if (bodyIsString && shouldCompress) {
    const accepted = acceptEncoding.split(', ')
    let compression
    /**/ if (accepted.includes('br')) compression = 'br'
    else if (accepted.includes('gzip')) compression = 'gzip'
    else return res
    if (compressionTypes[params.compression] && accepted.includes(params.compression)) {
      compression = params.compression
    }
    res.body = b64enc(compress(res.body, compression))
    res.isBase64Encoded = true
  }
  return res
}
