let parse = require('@architect/parser')
let path = require('path')
let fs = require('fs')
let util = require('util')
let aws = require('aws-sdk')
let arcFile = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
let cache = {}
let arc

module.exports = async function read({Key}) {
  let s3 = new aws.S3
  let env = process.env.NODE_ENV
  if (env === 'testing') {
    // Lookup the blob in ./public
    // assuming we're running from a lambda in src/**/*
    let readFile = util.promisify(fs.readFile)
    let filePath = path.join(process.cwd(), '..', '..', '..', 'public', Key)
    cache[Key] = await readFile(filePath, {encoding: 'utf8'})
  }
  else {
    // only do this once
    if (!arc)
      arc = parse(fs.readFileSync(arcFile).toString())

    // Lookup the Bucket by reading node_modules/@architect/shared/.arc
    let Bucket = getBucket(arc.static)

    // Lookup the blob
    if (!cache[Key]) {
      let result = await s3.getObject({Bucket, Key}).promise()
      cache[Key] = result.Body.toString()
    }
  }
  return cache[Key]
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
