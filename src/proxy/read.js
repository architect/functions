let path = require('path')
let fs = require('fs')
let util = require('util')
let aws = require('aws-sdk')
let cache = {}

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
    // Lookup the Bucket by reading node_modules/@architect/shared/.arc
    let Bucket = 'proxy-plus-bucket'

    // Lookup the blob
    if (!cache[Key]) {
      let result = await s3.getObject({Bucket, Key}).promise()
      cache[Key] = result.Body.toString()
    }
  }
  return cache[Key]
}
