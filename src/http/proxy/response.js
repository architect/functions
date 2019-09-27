let mime = require('mime-types')
let path = require('path')

/**
 * Normalizes response shape
 */
module.exports = function normalizeResponse ({response, result, Key, isProxy, config}) {
  let noCache = [
    'text/html',
    'application/json',
  ]
  response.headers = response.headers || {}

  // Establish Content-Type
  let contentType =
    response.headers['Content-Type'] || // Possibly get content-type passed via proxy plugins
    response.headers['content-type'] || // ...
    result && result.ContentType ||     // Fall back to what came down from S3's metadata
    mime.contentType(path.extname(Key)) // Finally, fall back to the mime type database

  // Set Content-Type
  response.headers['Content-Type'] = contentType

  // Set caching headers
  let neverCache = noCache.some(n => contentType.includes(n))
  if (config.cacheControl)
    response.headers['Cache-Control'] = config.cacheControl
  else if (neverCache)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
  else
    response.headers['Cache-Control'] = 'max-age=86400'

  // Populate optional userland headers
  if (config.headers)
    Object.keys(config.headers).forEach(h => response.headers[h] = config.headers[h])

  // Normalize important common header casings to prevent dupes
  if (response.headers['content-type']) {
    response.headers['Content-Type'] = response.headers['content-type']
    delete response.headers['content-type']
  }
  // Probably unable to be set via this code path, but normalize jic
  if (response.headers['cache-control']) {
    response.headers['Cache-Control'] = response.headers['cache-control']
    delete response.headers['cache-control']
  }

  let notArcSix = !process.env.ARC_CLOUDFORMATION
  let notArcProxy = !process.env.ARC_HTTP || process.env.ARC_HTTP === 'aws'
  let isArcFive = notArcSix && notArcProxy
  let isHTML = response.headers['Content-Type'].includes('text/html')
  if (isArcFive && isHTML && !isProxy) {
    // This is a deprecated code path that may be removed when Arc 5 exits LTS status
    // Only return string bodies for certain types, and ONLY in Arc 5
    response.body = Buffer.from(response.body).toString()
    response.type = response.headers['Content-Type'] // Re-set type or it will fall back to JSON
  }
  else {
    // Base64 everything else on the way out to enable text + binary support
    response.body = Buffer.from(response.body).toString('base64')
    response.isBase64Encoded = true
  }
  return response
}
