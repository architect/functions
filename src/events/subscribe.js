let parallel = require('run-parallel')

let fallback = {
  Records: [
    { Sns: { Message: JSON.stringify({}) } },
  ],
}

/**
 * Example usage:
 *
 * ```
 * let arc = require('@architect/functions')
 * function signup(record, callback) {
 *   console.log(record)
 *   callback()
 * }
 * exports.handler = arc.events.subscribe(signup)
 * ```
 */
module.exports = function _subscribe (type) {
  return function subscribe (fn) {
    let isEvents = type === 'events'
    // Async interface
    if (fn.constructor.name === 'AsyncFunction') {
      return async function lambda (event) {
        if (isEvents) {
          event = event && Object.keys(event).length ? event : fallback
        }
        return Promise.all(event.Records.map(async record => {
          try {
            let payload = isEvents ? record.Sns.Message : record.body
            let result = JSON.parse(payload)
            return await fn(result)
          }
          catch (err) {
            console.log('Subscribe error:', err)
            throw err
          }
        }))
      }
    }
    else {
      // Callback interface
      return function lambda (event, context, callback) {
        if (isEvents) {
          event = event && Object.keys(event).length ? event : fallback
        }
        // sns triggers send batches of records
        // so we're going to create a handler for each one
        // and execute them in parallel
        parallel(event.Records.map(function _iterator (record) {
          // Construct a handler function for each record
          return function _actualHandler (callback) {
            try {
              let payload = isEvents ? record.Sns.Message : record.body
              fn(JSON.parse(payload), callback)
            }
            catch (e) {
              callback(e)
            }
          }
        }), callback)
      }
    }
  }
}
