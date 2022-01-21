/**
 * Ensure env is one of: 'testing', 'staging', or 'production'
 */
let { ARC_ENV } = process.env
let validEnvs = [ 'testing', 'staging', 'production' ]
if (!validEnvs.includes(ARC_ENV)) {
  throw ReferenceError(`ARC_ENV env var is required for use with @architect/functions`)
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
arc.events = require('./events')(arc, 'events')
arc.queues = require('./events')(arc, 'queues')
arc.tables = require('./tables')(arc)
arc.middleware = http.middleware // backwards compat

module.exports = arc
