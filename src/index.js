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

let http = require('./http')
let _static = require('./static')
let serviceDiscovery = require('./discovery')
let ws = require('./ws')

let services
let arc = {
  http,
  static: _static,
  ws,
  services: function () {
    return new Promise(function (resolve, reject) {
      if (services) resolve(services)
      else serviceDiscovery(function (err, serviceMap) {
        if (err) reject(err)
        else {
          services = serviceMap
          resolve(services)
        }
      })
    })
  }
}
arc.events = require('./events')(arc)
arc.queues = require('./queues')(arc)
arc.tables = require('./tables')(arc)
arc.middleware = http.middleware // backwards compat

module.exports = arc
