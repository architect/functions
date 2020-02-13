let old = require('./old')
let lookup = require('../discovery')
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
function tables(callback) {
  let promise
  if (!callback) {
    promise = new Promise(function ugh(res, rej) {
      callback = function errback(err, result) {
        if (err) rej(err)
        else res(result)
      }
    })
  }
  /**
   * Read Architect manifest if local / sandbox, otherwise use service reflection
   * - Key on `staging` / `production` and not on `testing`
   * - Why? Some test harnesses (ahem) will automatically populate NODE_ENV with their own values, unbidden
   */
  let isStagingOrProd = process.env.NODE_ENV === 'staging' ||
                        process.env.NODE_ENV === 'production'
  let arcLocal = process.env.ARC_LOCAL

  if (client) {
    callback(null, client)
  }
  else if (isStagingOrProd && !arcLocal) {
    lookup.tables(function done(err, tables) {
      if (err) callback(err)
      else {
        client = factory(tables)
        callback(null, client)
      }
    })
  }
  else {
    sandbox(callback)
  }
  return promise
}

// Export directly for fast use
tables.doc = dynamo.direct.doc
tables.db = dynamo.direct.db

// Legacy compat methods
tables.insert = old.insert
tables.modify = old.modify
tables.update = old.update
tables.remove = old.remove
tables.destroy = old.destroy
tables.all = old.all
tables.save = old.save
tables.change = old.change

module.exports = tables
