let readSSM = require('./read-ssm')
let readArc = require('./read-arc')
let factory = require('./factory')
let sandbox = require('./sandbox')
let doc = require('./doc')
let db = require('./db')

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
 *
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
  if (process.env.NODE_ENV === 'testing') {
    readArc(function errback(err, arc) {
      if (err) callback(err)
      else callback(null, sandbox(arc))
    })
  }
  else {
    if (client) {
      callback(null, client)
    }
    else {
      readSSM(function done(err, tables) {
        if (err) callback(err)
        else {
          client = factory(tables)
          callback(null, client)
        }
      })
    }
  }
  return promise
}

// export for direct/fast use
tables.doc = doc
tables.db = db

module.exports = tables
