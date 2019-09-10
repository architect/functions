let binaryTypes = require('../helpers/binary-types')
let normalizeResponse = require('./response')
let mime = require('mime-types')
let path = require('path')
let aws = require('aws-sdk')
let transform = require('./transform')
let sandbox = require('./sandbox')

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

      // Normalize response
      response = normalizeResponse({
        response,
        result,
        Key,
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
