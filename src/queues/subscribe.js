let parallel = require('run-parallel')
/**
 * Exmaple usage:
 * ```
 * let arc = require('@architect/functions')
 * function signup(record, callback) {
 *   console.log(record)
 *   callback()
 * }
 * exports.handler = arc.queues.subscribe(signup)
 * ```
 */
module.exports = function _subscribe (fn) {
  // Async interface
  if (fn.constructor.name === 'AsyncFunction') {
    return async function lambda (event) {
      return await Promise.all(event.Records.map(async record => {
        try {
          let result = JSON.parse(record.body)
          return await fn(result)
        }
        catch (e) {
          console.log('Queue subscribe error:', e)
          throw e
        }
      }))
    }
  }
  else {
    // Callback interface
    return function _lambdaSignature (evt, ctx, callback) {
      // SQS triggers send batches of records
      // We'll create a handler for each one and execute them in parallel
      parallel(evt.Records.map(function _iterator (record) {
        // Construct a handler function for each record
        return function _actualHandler (callback) {
          try {
            fn(JSON.parse(record.body), callback)
          }
          catch (e) {
            callback(e)
          }
        }
      }), callback)
    }
  }
}
