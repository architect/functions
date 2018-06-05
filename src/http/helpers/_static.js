let fs = require('fs')
let path = require('path')
let parse = require('@architect/parser')
let arcFile = path.join(__dirname, '..', 'shared', '.arc')

module.exports = function _static(assetPath) {
  let arc = parse(fs.readFileSync(arcFile).toString())
  if (arc.static) {
    let bucket = getBucket(arc.static)//[process.env.NODE_ENV === 'staging'? 0 : 1][1]
    let url = `https://s3.amazonaws.com/${bucket}${assetPath}`
    return url
  }
  else {
    // passthru
    return assetPath
  }
}

function getBucket(statics) {
  if (statics[0][0] === process.env.NODE_ENV)
    return statics[0][1]
  if (statics[1][0] === process.env.NODE_ENV)
    return statics[1][1]
}
