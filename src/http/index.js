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
// Proxy
let proxy = require('./proxy')

http.helpers = {
  bodyParser,
  interpolate,
  static: _static,
  url
}
http.session = {read, write}
http.async = _async
http.middleware = _async
http.proxy = proxy

module.exports = http
