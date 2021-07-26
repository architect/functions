// HTTP
let http = require('./http')

// HTTP helpers
let bodyParser = require('./helpers/body-parser')
let interpolate = require('./helpers/params')
let _static = require('../static')
let url = require('./helpers/url')

// Session
let read = require('./session/read')
let write = require('./session/write')

// Middleware
let _async = require('./async')
let express = require('./express')

http.helpers = {
  bodyParser,
  interpolate,
  static: _static,
  url
}
http.session = { read, write }
http.async = _async
http.express = express

// Legacy methods
http.middleware = _async

module.exports = http
