let fs = require('fs')
let path = require('path')
let parse = require('@architect/parser')
let arcFile = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
let arc

module.exports = function _static(assetPath) {
  // just passthru if we're not running in staging or production
  let runningLocally = process.env.NODE_ENV === 'testing'
  if (runningLocally) {
    return `/_static${assetPath}`
  }
  // only do this once
  if (!arc) {
    arc = parse(fs.readFileSync(arcFile).toString())
  }
  // S3 is the oldest AWS service, and has a bit of cruft
  // if region is us-east-1, S3 paths are: http://s3.amazonaws.com/bucket
  // if region isn't us-east-1, paths are: http://s3-aws-region.amazonaws.com/bucket
  let bucket = getBucket(arc.static)
  let region = process.env.AWS_REGION
  let isOGS3 = region === 'us-east-1'
  let S3domain = isOGS3 ? `https://s3.amazonaws.com/` : `https://s3-${region}.amazonaws.com/`
  let url = S3domain + bucket + assetPath
  return url
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
