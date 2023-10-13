let waterfall = require('run-waterfall')
let old = require('./old')
let factory = require('./factory')

// cheap client cache
let client = false

/**
 * Example usage:
 * ```
 * let arc = require('architect/functions')
 * exports.handler = async function http(req) {
 *  let data = await arc.tables()
 *  await data.tacos.put({ taco: 'aguacate' })
 *  return { statusCode: 200 }
 * }
 * ```
 */
module.exports = function tables (arc) {

  function api (options = {}, callback) {
    let promise
    if (!callback) {
      promise = new Promise(function ugh (res, rej) {
        callback = function errback (err, result) {
          if (err) rej(err)
          else res(result)
        }
      })
    }

    if (client) {
      callback(null, client)
    }
    else {
      waterfall([
        function (callback) {
          arc.services()
            .then(serviceMap => {
              callback(null, { tables: serviceMap.tables, options })
            })
            .catch(err => {
              callback(err)
            })
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

  // Legacy compat methods
  api.insert =  old.insert
  api.modify =  old.modify
  api.update =  old.update
  api.remove =  old.remove
  api.destroy = old.destroy
  api.all =     old.all
  api.save =    old.save
  api.change =  old.change

  return api
}
