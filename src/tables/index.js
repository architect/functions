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
   */
  let testing = process.env.NODE_ENV === 'testing'
  let runningLocally = testing || process.env.ARC_LOCAL
  if (runningLocally) {
    sandbox(callback)
  }
  else if (client) {
    callback(null, client)
  }
  else {
    lookup.tables(function done(err, tables) {
      if (err) callback(err)
      else {
        client = factory(tables)
        callback(null, client)
      }
    })
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
