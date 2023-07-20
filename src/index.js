let { sandboxVersionAtLeast } = require('./lib')

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

let _static = require('./static')
let events = require('./events')
let http = require('./http')
let serviceDiscovery = require('./discovery')
let tables = require('./tables')
let ws = require('./ws')

let servicesMap
/** @returns {Promise<Record<String, any>>} Architect services map */
function services () {
  return new Promise(function (resolve, reject) {
    if (servicesMap) resolve(servicesMap)
    else serviceDiscovery(function (err, map) {
      if (err) reject(err)
      else {
        servicesMap = map
        resolve(servicesMap)
      }
    })
  })
}

/** Architect Node.js runtime helpers. */
let arc = {
  /** Middleware and request/response normalization for `@http` functions. */
  http,
  /** Retrieve the Architect service map: an object mapping plugins and Arc infrastructure. */
  services,
  /** Helper to get the fingerprinted path of a given static asset. */
  static: _static,
  /** Interact with WebSocket services. Declare endpoints with the `@ws` pragma. */
  ws,
  /** Publish and subscribe helpers for `@events` functions. */
  events: events({ services }, 'events'),
  /** Publish and subscribe helpers for `@queues` functions. */
  queues: events({ services }, 'queues'),
  /** Create a DynamoDB client for your application's `@tables`. */
  tables: tables({ services }),
}

module.exports = arc
