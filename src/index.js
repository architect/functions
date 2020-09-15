/**
 * Ensure env is one of: 'testing', 'staging', or 'production'
 * - Some test harnesses (ahem) will automatically populate NODE_ENV with their own values, unbidden
 * - Due to tables.direct auto initializing, always set (or override) default NODE_ENV to 'testing'
 */
let env = process.env.NODE_ENV
let isNotStagingOrProd = env !== 'staging' && env !== 'production'
if (!env || isNotStagingOrProd) {
  process.env.NODE_ENV = 'testing'
}

let events = require('./events')
let http = require('./http')
let queues = require('./queues')
let _static = require('./static')
let tables = require('./tables')
let send = require('./ws')

let arc = {
  events,
  http,
  queues,
  static: _static,
  tables,
  ws: { send },
}

// backwards compat
arc.proxy = {}
arc.proxy.public = http.proxy.public
arc.middleware = http.middleware
// backwards compat

module.exports = arc
