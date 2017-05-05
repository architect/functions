var assert = require('@smallwins/validate/assert')
var fs = require('fs')
var mkdir = require('mkdirp').sync

module.exports = function _createLambdaCode(params, callback) {
  assert(params, {
    event: String,
    app: String,
  })
  mkdir('src')
  mkdir('src/events')
  mkdir(`src/events/${params.event}`)
  // copy src/events/lambda-name/index.js
  // npm init package.json
  // npm i @smallwins/arc-prototype
  callback()
}
