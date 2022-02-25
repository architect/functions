let { sandboxVersionAtLeast } = require('./lib/version')

/**
 * Ensure env is one of: 'testing', 'staging', or 'production'
 * If in Sandbox, meet version requirements
 */
let { ARC_ENV, ARC_SANDBOX } = process.env
let validEnvs = [ 'testing', 'staging', 'production' ]
// Backfill ARC_ENV if Functions is running outside of Sandbox in a test suite
if (!ARC_ENV) {
  process.env.ARC_ENV = ARC_ENV = 'testing'
}
if (!validEnvs.includes(ARC_ENV)) {
  throw ReferenceError(`ARC_ENV env var is required for use with @architect/functions`)
}
if (ARC_SANDBOX && !sandboxVersionAtLeast('5.0.0')) {
  throw ReferenceError('Incompatible version: please upgrade to Sandbox >=5.x or Architect >=10.x')
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

module.exports = arc
