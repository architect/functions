let binaryTypes = require('../helpers/binary-types')
let {httpError} = require('../errors')
let fs = require('fs')
let {join} = require('path')
let templatizeResponse = require('./templatize')
let normalizeResponse = require('./response')
let mime = require('mime-types')
let path = require('path')
let aws = require('aws-sdk')
let transform = require('./transform')
let sandbox = require('./sandbox')

// Try to hit disk to load the static manifest as little as possible
let assets
let staticManifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'static.json')
if (assets === false) {
  null /*noop*/
}
else if (fs.existsSync(staticManifest) && !assets) {
  let file = fs.readFileSync(staticManifest).toString()
  assets = JSON.parse(file)
}
else {
  assets = false
}

/**
 * arc.proxy.read
 *
 * Reads a file from s3 resolving an HTTP Lambda friendly payload
 *
 * @param {Object} params
 * @param {String} params.Key
 * @param {String} params.Bucket
 * @param {String} params.IfNoneMatch
 * @param {Object} params.config
 * @returns {Object} {statusCode, headers, body}
 */
module.exports = async function read({Bucket, Key, IfNoneMatch, isProxy, config}) {

  // early exit if we're running in the sandbox
  let local = process.env.NODE_ENV === 'testing' || process.env.ARC_LOCAL
  if (local)
    return await sandbox({Key, isProxy, config, assets})

  let headers = {}
  let response = {}

  try {
    // If client sends if-none-match, use it in S3 getObject params
    let matchedETag = false
    let s3 = new aws.S3

    // If the static asset manifest has the key, use that, otherwise fall back to the original Key
    let contentType = mime.contentType(path.extname(Key))
    let capture = [
      'text/html',
      'application/json',
      // markdown?
    ]
    let isCaptured = capture.some(type => contentType.includes(type))
    if (assets && assets[Key] && isCaptured)
      Key = assets[Key]

    let options = {Bucket, Key}
    if (IfNoneMatch)
      options.IfNoneMatch = IfNoneMatch

    let result = await s3.getObject(options).promise().catch(e => {
      // ETag matches (getObject error code of NotModified), so don't transit the whole file
      if (e.code === 'NotModified') {
        matchedETag = true
        headers.ETag = IfNoneMatch
        response = {
          statusCode: 304,
          headers,
        }
      }
      else {
        // important! rethrow the error do not swallow it
        throw e
      }
    })

    // No ETag found, return the blob
    if (!matchedETag) {
      let isBinary = binaryTypes.some(type => result.ContentType.includes(type) || contentType.includes(type))

      // Transform first to allow for any proxy plugin mutations
      response = transform({
        Key,
        config,
        isBinary,
        defaults: {
          headers,
          body: result.Body
        },
      })

      // Handle templating
      response = templatizeResponse({
        isBinary,
        assets,
        response
      })

      // Normalize response
      response = normalizeResponse({
        response,
        result,
        Key,
        isProxy,
        config
      })

      // Add ETag
      response.headers.ETag = result.ETag
    }
    return response
  }
  catch(e) {
    /* TODO move this logic elsewhere / this blocks real errors! look for 404.html on s3
    try {
      let Key = bucket && bucket.folder ? `${bucket.folder}/404.html` : '404.html'
      let s3 = new aws.S3
      let result = await s3.getObject({Bucket, Key}).promise()
      let body = result.Body.toString()
      return {headers, statusCode: 404, body}
    }
    catch(err) {
      return {headers, statusCode: 404, body: 'File not found'}
    }*/
    // final err fallback
    let notFound = e.name === 'NoSuchKey'
    let statusCode = notFound ? 404 : 500
    let title = notFound ? 'Not Found' : e.name
    let message = `
      ${e.message}<br>
      <pre>${e.stack}</pre>
    `
    return httpError({statusCode, title, message})
  }
}
