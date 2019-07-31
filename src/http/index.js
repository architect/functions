// HTTP
let http = require('./http')
// HTTP helpers
let body = require('./helpers/parse-body')
let interpolate = require('./helpers/params')
let static = require('../static')
let url = require('./helpers/url')
// Session
let read = require('./session/read')
let write = require('./session/write')
// Middleware
let middleware = require('./middleware')
// Proxy
let proxy = require('./proxy')

http.helpers = {body, interpolate, static, url}
http.session = {read, write}
http.middleware = middleware
http.proxy = proxy

module.exports = http
