/* eslint-disable global-require */

// HTTP
let http = require('./http')
http.async = require('./async')

// HTTP helpers
http.helpers = {
  bodyParser:   require('./helpers/body-parser'),
  interpolate:  require('./helpers/params'),
  url: require('./helpers/url'),
}

// Session
http.session = {
  read: require('./session/read'),
  write: require('./session/write'),
}

module.exports = http
