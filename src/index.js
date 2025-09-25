const { sandboxVersionAtLeast } = require('./lib')

/**
 * Ensure env is one of: 'testing', 'staging', or 'production'
 * If in Sandbox, meet version requirements
 */
let { ARC_ENV, ARC_SANDBOX } = process.env
const validEnvs = ['testing', 'staging', 'production']
// Backfill ARC_ENV if Functions is running outside of Sandbox in a test suite
if (!ARC_ENV) {
  process.env.ARC_ENV = ARC_ENV = 'testing'
}
if (!validEnvs.includes(ARC_ENV)) {
  throw ReferenceError('ARC_ENV env var is required for use with @architect/functions')
}
if (ARC_SANDBOX && !sandboxVersionAtLeast('5.0.0')) {
  throw ReferenceError('Incompatible version: please upgrade to Sandbox >=5.x or Architect >=10.x')
}

const http = require('./http')
const _static = require('./static')
const serviceDiscovery = require('./discovery')
const ws = require('./ws')

let services
const arc = {
  http,
  static: _static,
  ws,
  services: () =>
    new Promise((resolve, reject) => {
      if (services) resolve(services)
      else
        serviceDiscovery((err, serviceMap) => {
          if (err) reject(err)
          else {
            services = serviceMap
            resolve(services)
          }
        })
    }),
}
arc.events = require('./events')(arc, 'events')
arc.queues = require('./events')(arc, 'queues')
arc.tables = require('./tables')(arc)

module.exports = arc
