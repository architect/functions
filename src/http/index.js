// helpers
let static = require('./helpers/static')
let url = require('./helpers/url')
let interpolate = require('./helpers/params')

// session
let read = require('./session/read')
let write = require('./session/write')

// express-style middleware
let http = require('./http')

http.helpers = {
  static,
  url,
  interpolate,
}

http.session = {
  read,
  write,
}

module.exports = http
