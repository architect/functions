let binaryTypes = require('../../helpers/binary-types')
let { httpError } = require('../../errors')
let fs = require('fs')
let  {join } = require('path')
let templatizeResponse = require('../format/templatize')
let normalizeResponse = require('../format/response')
let mime = require('mime-types')
let path = require('path')
let aws = require('aws-sdk')
let transform = require('../format/transform')

/**
 * arc.proxy.read
 *
 * Reads a file from S3, resolving an HTTP Lambda friendly payload
 *
 * @param {Object} params
 * @param {String} params.Key
 * @param {String} params.Bucket
 * @param {String} params.IfNoneMatch
 * @param {Object} params.config
 * @returns {Object} {statusCode, headers, body}
 */
async function readS3 (params) {

  let { Bucket, Key, IfNoneMatch, isProxy, config } = params
  let { ARC_STATIC_FOLDER } = process.env
  let headers = {}
  let response = {}

  try {
    // If client sends If-None-Match, use it in S3 getObject params
    let matchedETag = false
    let s3 = new aws.S3

    // If the static asset manifest has the key, use that, otherwise fall back to the original Key
    let contentType = mime.contentType(path.extname(Key))
    let capture = [
      'text/html',
      'application/json'
    ]
    let isCaptured = capture.some(type => contentType.includes(type))
    if (assets && assets[Key] && isCaptured) {
      Key = assets[Key]
    }

    let options = { Bucket, Key }
    if (IfNoneMatch) {
      options.IfNoneMatch = IfNoneMatch
    }

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
        // Important: do not swallow this error otherwise!
        throw e
      }
    })

    // No ETag found, return the blob
    if (!matchedETag) {
      let contentEncoding = result.ContentEncoding
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
      // If encoded, add that too
      if (contentEncoding) response.headers['Content-Encoding'] = contentEncoding
    }

    if (!response.statusCode) {
      response.statusCode = 200
    }

    return response
  }
  catch(e) {
    let notFound = e.name === 'NoSuchKey'
    if (notFound) {
      try {
        let folder = ARC_STATIC_FOLDER || config.bucket && config.bucket.folder? config.bucket.folder : false
        let notFound = folder? `${folder}/404.html` : '404.html'
        let s3 = new aws.S3
        let result = await s3.getObject({ Bucket, Key: notFound }).promise()
        let body = result.Body.toString()
        return {headers, statusCode: 404, body}
      }
      catch(err) {
        let statusCode = err.name === 'NoSuchKey'? 404 : 500
        let title = err.name
        let message = `
          ${err.message } <pre><b>${ Key }</b></pre><br>
          <pre>${err.stack}</pre>
        `
        return httpError({statusCode, title, message})
      }
    }
    else {
      let title = e.name
      let message = `
        ${e.message}<br>
        <pre>${e.stack}</pre>
      `
      return httpError({statusCode: 500, title, message})
    }
  }
}

/**
 * Fingerprinting manifest
 *   Load the manifest, try to hit the disk as infrequently as possible across invocations
 */
let assets
let staticManifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'static.json')
if (assets === false) {
  null /*noop*/
}
else if (fs.existsSync(staticManifest) && !assets) {
  assets = JSON.parse(fs.readFileSync(staticManifest))
}
else {
  assets = false
}

module.exports = readS3
