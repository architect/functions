var path = require('path')
var parse = require('@architect/parser')
var fs = require('fs')
var cache = {}

module.exports = function _static(assetPath) {
  if (cache[assetPath]) {
    return cache[assetPath]
  }
  else {

    var arcFile = path.join(__dirname, '..', 'shared', '.arc')
    var exists = fs.existsSync(arcFile)
    var testing = process.env.NODE_ENV === 'testing' || typeof process.env.NODE_ENV === 'undefined'

    if (testing) {
      // testing env is passthru
      cache[assetPath] = assetPath
    }
    else if (exists) {
      var arc = parse(fs.readFileSync(arcFile).toString())
      if (arc.static) {
        var bucket = arc.static[process.env.NODE_ENV === 'staging'? 0 : 1][1]
        var url = `https://s3-${process.env.AWS_REGION}.amazonaws.com/${bucket}${assetPath}`
        cache[assetPath] = url
      }
      else {
        // missing arc.static so passthru
        cache[assetPath] = assetPath
      }
    }
    else {
      // missing .arc so passthru
      cache[assetPath] = assetPath
    }
    return cache[assetPath]
  }
}
