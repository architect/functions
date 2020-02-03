let parallel = require('run-parallel')

let fallback = {
  Records: [
    JSON.stringify({ Sns: { Message: {} } })
  ]
}

/**
 * // Example usage:
 *
 * var arc = require('@architect/functions')
 *
 * function signup(record, callback) {
 *   console.log(record)
 *   callback()
 * }
 *
 * exports.handler = arc.events.subscribe(signup)
 */
module.exports = function _subscribe(fn) {
  if (fn.constructor.name === 'AsyncFunction') {
    return async function lambda(event) {
      event = event || fallback
      return await Promise.all(event.Records.map(async record=> {
        try {
          let result = JSON.parse(record.Sns.Message)
          return await fn(result)
        }
        catch(e) {
          throw e
        }
      }))
    }
  }
  else {
    // callback interface
    return function _lambdaSignature(event, context, callback) {
      event = event || fallback
      // sns triggers send batches of records
      // so we're going to create a handler for each one
      // and execute them in parallel
      parallel(event.Records.map(function _iterator(record) {
        // for each record we construct a handler function
        return function _actualHandler(callback) {
          try {
            fn(JSON.parse(record.Sns.Message), callback)
          }
          catch(e) {
            callback(e)
          }
        }
      }), callback)
    }
  }
}
