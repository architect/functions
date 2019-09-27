let read = require('./read')

/**
 * arc.proxy.public
 *
 * @param config - object, for configuration
 * @param config.spa - boolean, forces index.html no matter the folder depth
 * @param config.plugins - object, configure proxy-plugin-* transforms per file extension
 * @param config.alias - object, map of root rel urls to map to fully qualified root rel urls
 * @param config.bucket - object, {staging, production} override the s3 bucket names
 * @param config.bucket.staging - object, {staging, production} override the s3 bucket names
 * @param config.bucket.production - object, {staging, production} override the s3 bucket names
 * @param config.bucket.folder - string, bucket folder
 * @param config.cacheControl - string, set a custom Cache-Control max-age header value
 *
 * @returns HTTPLambda - an HTTP Lambda function that proxies calls to S3
 */
module.exports = function proxyPublic(config={}) {
  return async function proxy(req) {

    let isProduction = process.env.NODE_ENV === 'production'
    let configBucket = config.bucket
    let bucketSetting = isProduction
      ? configBucket && configBucket['production']
      : configBucket && configBucket['staging']
    // Ok, all that out of the way, let's set the actual bucket, eh?
    let Bucket = process.env.ARC_STATIC_BUCKET || bucketSetting
    if (!Bucket) throw Error('Bucket must be configured, use ARC_STATIC_BUCKET or config object')
    let Key // resolved below

    // Allow unsetting of SPA mode with ARC_STATIC_SPA
    let spa = process.env.ARC_STATIC_SPA === 'false'
      ? false
      : config && config.spa
    if (!spa) config.spa = false
    if (spa) {
      // if spa force index.html
      let isFolder = req.path.split('/').pop().indexOf('.') === -1
      Key = isFolder? 'index.html' : req.path.substring(1)
    }
    else {
      // return index.html for root…otherwise passthru the path minus leading slash
      Key = req.path === '/'? 'index.html' : req.path.substring(1)
      // add index.html to any empty folder path
      let isFolder = Key != 'index.html' && req.path.lastIndexOf('/') === req.path.length - 1
      if (isFolder) {
        Key = Key + 'index.html'
      }
    }

    // allow alias override of Key
    let aliasing = config && config.alias && config.alias.hasOwnProperty(req.path)
    if (aliasing) {
      Key = config.alias[req.path].substring(1) // remove leading /
    }

    // allow bucket folder prefix
    let folder = process.env.ARC_STATIC_FOLDER || configBucket && configBucket.folder
    if (folder) {
      Key = `${folder}/${Key}`
    }

    // strip staging/ and production/ from req urls
    if (Key.startsWith('staging/') || Key.startsWith('production/')) {
      Key = Key.replace('staging/', '')
               .replace('production/', '')
    }

    // normalize if-none-match header to lower case; it differs between environments
    let find = k => k.toLowerCase() === 'if-none-match'
    let IfNoneMatch = req.headers && req.headers[Object.keys(req.headers).find(find)]

    // Ensure response shape is correct for proxy SPA responses
    let isProxy = req.resource === '/{proxy+}'

    return await read({Key, Bucket, IfNoneMatch, isProxy, config})
  }
}
