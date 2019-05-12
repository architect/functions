let fs = require('fs')
let path = require('path')
let parse = require('@architect/parser')
let arcFile = path.join(process.cwd(), 'node_modules', '@architect', 'shared', '.arc')
let arc

module.exports = function _static(assetPath) {
  let folder = process.env.ARC_STATIC_FOLDER ? '/' + process.env.ARC_STATIC_FOLDER : ''
  let region = process.env.AWS_REGION
  let S3domain = bucket => `https://${bucket}.s3.${region}.amazonaws.com${folder}`

  // Just passthru if we're not running in staging or production
  let runningLocally = process.env.NODE_ENV === 'testing'
  if (runningLocally) {
    return `/_static${assetPath}`
  }
  // Static env var takes precedence if present
  else if (process.env.ARC_STATIC_BUCKET) {
    let url = S3domain(process.env.ARC_STATIC_BUCKET) + assetPath
    return url
  }
  else {
    if (!arc) {
      // Only load the arc file once (if possible)
      arc = parse(fs.readFileSync(arcFile).toString())
    }
    let bucket = getBucket(arc.static)
    let url = S3domain(bucket) + assetPath
    return url
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
