let fs = require('fs')
let path = require('path')
let parse = require('@architect/parser')
let arcFile = path.join(__dirname, '..', '..', '..', '..', 'shared', '.arc')
let arc

module.exports = function _static(assetPath) {
  // only do this once
  if (!arc) {
    arc = parse(fs.readFileSync(arcFile).toString())
  }
  // just passthru if we're not running in staging or production
  let runningLocally = arc.static && process.env.NODE_ENV === 'testing'
  if (runningLocally) {
    return assetPath
  }
  else {
    let bucket = getBucket(arc.static)
    let url = `https://s3.amazonaws.com/${bucket}${assetPath}`
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
