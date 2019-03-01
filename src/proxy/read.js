let parse = require('@architect/parser')
let mime = require('mime-types')
let path = require('path')
let fs = require('fs')
let util = require('util')
let aws = require('aws-sdk')
let transform = require('./transform')

let readFile = util.promisify(fs.readFile)
let encoding = 'utf8'
let arcFile = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
let cache = {}
let arc
let env = process.env.NODE_ENV

/**
 * reads a file; possibly transforms and caches it
 *
 * @param Key - the Key for the S3 Bucket
 * @param config - the full arc.proxy.pubic config
 * @returns - an HTTP Lambda friendly response {headers, body, status}
 */
module.exports = async function read(Key, config={}, reqHeaders) {

  try {
    // gets the default content-type from the Key
    let type = mime.contentType(path.extname(Key))

    // defines whether we will allow remote caching
    let nopes = [
      'text/html',
      'application/json',
    ]
    let neverCache = nopes.some(n => type.startsWith(n)) //&& env === 'production'

    // assign ETag later for client / CDN cache lookup
    let ETag

    if (env === 'testing') {
      // Lookup the blob in ./public
      // assuming we're running from a lambda in src/**/*
      let filePath = path.join(process.cwd(), '..', '..', '..', 'public', Key)
      if (!fs.existsSync(filePath))
        throw ReferenceError(`${filePath} not found`)

      // read the file
      let body = await readFile(filePath, {encoding})
      cache[Key] = transform({
        Key,
        config,
        defaults: {
          headers: {'content-type': type},
          body
        },
      })
    }

    // Lookup the blob
    if (!cache[Key]) {

      // Lookup the Bucket by reading node_modules/@architect/shared/.arc
      if (!arc && !config.bucket) {
        // only do this once
        let raw = await readFile(arcFile, {encoding})
        arc = parse(raw)
      }

      // get the Bucket
      let Bucket = config.bucket? config.bucket[env] : getBucket(arc.static)

      // strip staging/ and production/ from req urls
      if (Key.startsWith('staging/') || Key.startsWith('production/'))
        Key = Key.replace('staging/', '').replace('production/')

      // add path prefix
      if (config.bucket && config.bucket.folder)
        Key = `${config.bucket.folder}/${Key}`

      let s3 = new aws.S3
      let result = await s3.getObject({
        Bucket,
        Key,
      }).promise()

      ETag = result.ETag
      let headers = {
        'content-type': type,
        'etag': result.ETag,
        'cache-control': 'no-cache'
      }

      if (!neverCache) {
        // TODO ↓ change to 86400 (or something larger) closer to release ↓
        headers['cache-control'] = 'max-age=600'
      }

      cache[Key] = transform({
        Key,
        config,
        defaults: {
          headers,
          body: result.Body.toString()
        },
      })
    }

    // return 304 if ETag is matched and it's cacheable
    if (reqHeaders && reqHeaders['if-none-match'] === ETag && !neverCache) {
      // will not work locally in Arc prior to fixing #323
      cache[Key].statusCode = 304
      return cache[Key]
    }
    else return cache[Key]
  }
  catch(e) {
    // render the error to html
    let headers = {'content-type':'text/html; charset=utf8'}

    if (env === 'testing') {
      //look for public/404.html
      let http404 = path.join(process.cwd(), '..', '..', '..', 'public', '404.html')
      let exists = fs.existsSync(http404)
      if (exists) {
        let body = await readFile(http404, {encoding})
        return {headers, statusCode:404, body}
      }
    }

    if (env === 'staging' || env === 'production') {
      //look for 404.html on s3
      try {
        if (!arc && !config.bucket) {
          let raw = await readFile(arcFile, {encoding})
          arc = parse(raw)
        }
        let Bucket = config.bucket? config.bucket[env] : getBucket(arc.static)
        let Key = config.bucket && config.bucket.folder? `${config.bucket.folder}/404.html` : '404.html'
        let s3 = new aws.S3
        let result = await s3.getObject({Bucket, Key}).promise()
        let body = result.Body.toString()
        return {headers, statusCode:404, body}
      }
      catch(er) {
        // noop if the 404 isn't there
      }
    }

    // final err fallback
    let err = `
      <h1>${e.name}</h1>
      <pre>${e.code}</pre>
      <p>${e.message}</p>
      <pre>${e.stack}</pre>
    `
    return {headers, body:err}
  }
}

// helper returns the @static value for the current NODE_ENV
function getBucket(static) {
  let staging
  let production
  static.forEach(thing=> {
    if (thing[0] === 'staging') {
      staging = thing[1]
    }
    if (thing[0] === 'production') {
      production = thing[1]
    }
  })
  if (env === 'staging')
    return staging
  if (env === 'production')
    return production
}
