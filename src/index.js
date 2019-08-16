let events = require('./events')
let http = require('./http')
let queues = require('./queues')
let _static = require('./static')
let tables = require('./tables')
let ws = require('./ws')

let arc = {
  events,
  http,
  queues,
  static: _static,
  tables,
  ws,
}

// backwards compat
arc.proxy = {}
arc.proxy.public = http.proxy.public
arc.middleware = http.middleware
// backwards compat

module.exports = arc
