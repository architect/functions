let binaryTypes = require('../helpers/binary-types')
let mime = require('mime-types')
let path = require('path')
let aws = require('aws-sdk')
let transform = require('./transform')
let sandbox = require('./sandbox')

let noCache = [
  'text/html',
  'application/json',
]

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
module.exports = async function read({Bucket, Key, IfNoneMatch, config}) {

  // early exit if we're running in the sandbox
  if (process.env.NODE_ENV === 'testing')
    return await sandbox({Key, config})

  let headers = {}
  let response = {}

  try {
    // if client sends if-none-match, use it in s3 getObject params
    let matchedETag = false
    let s3 = new aws.S3

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
      let isBinary = binaryTypes.some(type => result.ContentType.includes(type) || mime.contentType(path.extname(Key)).includes(type))

      // Transform first to allow for any proxy plugin mutations
      response = transform({
        Key,         // TODO rename to file
        config,
        isBinary,
        defaults: {  // TODO rename to response
          headers,
          body: result.Body
        },
      })

      // Base64 everything on the way out to enable binary support
      response.body = Buffer.from(response.body).toString('base64')
      response.isBase64Encoded = true

      /**
       * Headers
       */
      // ETag
      response.headers.ETag = result.ETag

      // Establish Content-Type
      let contentType =
        response.headers['Content-Type'] || // Possibly get content-type passed via proxy plugins
        response.headers['content-type'] || // ...
        result.ContentType ||               // Fall back to what came down from S3's metadata
        mime.contentType(path.extname(Key)) // Finally, fall back to the mime type database
      // Set Content-Type
      response.headers['Content-Type'] = contentType

      // Set caching headers
      let neverCache = noCache.some(n => contentType.includes(n))
      if (neverCache)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
      else
        response.headers['Cache-Control'] = 'max-age=86400'

      // Populate optional userland headers
      if (config.headers)
        Object.keys(config.headers).forEach(h => headers[h] = response.headers[h])

      // Normalize important common header casings to prevent dupes
      if (response.headers['content-type']) {
        response.headers['Content-Type'] = response.headers['content-type']
        delete response.headers['content-type']
      }
      if (response.headers['cache-control']) {
        response.headers['Cache-Control'] = response.headers['cache-control']
        delete response.headers['cache-control']
      }
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
    return {
      statusCode: e.name === 'NoSuchKey'? 404 : 500,
      headers: {'content-type': 'text/html; charset=utf8;'},
      body: `
        <h1>${e.name === 'NoSuchKey'? 'Not Found' : e.name}</h1>
        <p>${e.message}</p>
        <pre>${e.stack}</pre>
      `
    }
  }
}
