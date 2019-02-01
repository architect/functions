let parse = require('@architect/parser')
let mime = require('mime-types')
let path = require('path')
let fs = require('fs')
let util = require('util')
let aws = require('aws-sdk')

let readFile = util.promisify(fs.readFile)
let encoding = 'utf8'
let arcFile = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
let cache = {}
let arc

/**
 * read a file from S3
 * returns {headers:{'content-type':type}, body}
 */
module.exports = async function read(Key) {
  let env = process.env.NODE_ENV
  let type = mime.contentType(path.extname(Key))
  try {
    if (env === 'testing') {
      // Lookup the blob in ./public
      // assuming we're running from a lambda in src/**/*
      let filePath = path.join(process.cwd(), '..', '..', '..', 'public', Key)
      let body = await readFile(filePath, {encoding})
      cache[Key] = {headers:{'content-type':type}, body}
    }
    else {
      // Lookup the blob
      if (!cache[Key]) {
        // Lookup the Bucket by reading node_modules/@architect/shared/.arc
        if (!arc) {
          // only do this once
          let raw = await readFile(arcFile, {encoding})
          arc = parse(raw)
        }
        // read the file
        let Bucket = getBucket(arc.static)
        let s3 = new aws.S3
        let result = await s3.getObject({Bucket, Key}).promise()
        cache[Key] = {headers:{'content-type':type}, body: result.Body.toString()}
      }
    }
    return cache[Key]
  }
  catch(e) {
    // todo: catch 404 and look for /404.html to return
    let err = `
      <h1>${e.name}</h1>
      <pre>${e.code}</pre>
      <p>${e.message}</p>
      <pre>${e.stack}</pre>
    `
    return {headers:{'content-type':'text/html'}, body:err}
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
  if (process.env.NODE_ENV === 'staging')
    return staging
  if (process.env.NODE_ENV === 'production')
    return production
}
