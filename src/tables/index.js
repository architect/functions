let waterfall = require('run-waterfall')
let old = require('./old')
let factory = require('./factory')
let sandbox = require('./sandbox')
let dynamo = require('./dynamo')

// cheap client cache
let client = false

/**
 * // example usage:
 * let arc = require('architect/functions')
 *
 * exports.handler = async function http(req) {
 *  let data = await arc.tables()
 *  await data.tacos.put({taco: 'pollo'})
 *  return {statusCode: 200}
 * }
 */
function tables (arc) {
  function api (callback) {
    let promise
    if (!callback) {
      promise = new Promise(function ugh (res, rej) {
        callback = function errback (err, result) {
          if (err) rej(err)
          else res(result)
        }
      })
    }
    /**
     * Read Architect manifest if local / sandbox, otherwise use service reflection
     */
    let runningLocally = process.env.ARC_ENV === 'testing'
    if (runningLocally) {
      sandbox(dynamo, callback)
    }
    else if (client) {
      callback(null, client)
    }
    else {
      waterfall([
        function (callback) {
          arc.services().then(function (serviceMap) {
            callback(null, serviceMap.tables)
          }).catch(callback)
        },
        factory,
        function (created, callback) {
          client = created
          callback(null, client)
        }
      ], callback)
    }
    return promise
  }
  // Export directly for fast use
  api.doc = dynamo.direct.doc
  api.db = dynamo.direct.db

  // Legacy compat methods
  api.insert = old.insert
  api.modify = old.modify
  api.update = old.update
  api.remove = old.remove
  api.destroy = old.destroy
  api.all = old.all
  api.save = old.save
  api.change = old.change
  return api
}

module.exports = tables
