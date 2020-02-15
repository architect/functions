let waterfall = require('run-waterfall')
let discovery = require('./discovery')
let factory = require('./factory')
let dynamo = require('./dynamo')
let compat = require('./compat')

// cheap client cache
let client = false

/**
 * @param {function} errback (optional)
 * @returns {promise} resolves a dynamo client prebound with tablenames
 *
 *  // example usage:
 *  let arc = require('architect/functions')
 *
 *  exports.handler = async function http(req) {
 *    let data = await arc.tables()
 *    await data.tacos.put({taco: 'pollo'})
 *    return {statusCode: 200}
 *  }
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
  if (client) {
    callback(null, client)
  }
  else {
    waterfall([
      discovery,
      factory,
      function cache(created, callback) {
        client = created
        callback(null, client)
      }
    ], callback)
  }
  return promise
}

// Export directly for fast use
tables.doc = dynamo.direct.doc
tables.db = dynamo.direct.db

// Legacy compat methods
tables.insert = compat.insert
tables.modify = compat.modify
tables.update = compat.update
tables.remove = compat.remove
tables.destroy = compat.destroy
tables.all = compat.all
tables.save = compat.save
tables.change = compat.change

module.exports = tables
