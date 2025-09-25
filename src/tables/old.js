let parallel = require('run-parallel')

/**
 * Example usage:
 * ```
 * let trigger = require('aws-dynamodb-lambda-trigger/lambda')
 * function onInsert(record, callback) {
 *   console.log(record)
 *   callback(null, record) // errback style; results passed to context.succeed
 * }
 * module.exports = trigger.insert(onInsert)
 * ```
 */
function __trigger (types, handler) {
  return function __lambdaSignature (evt, ctx) {
    // DynamoDB triggers send batches of records, so create a handler for each
    let handlers = evt.Records.map(function (record) {
      // Construct a handler function for each record
      return function __actualHandler (callback) {
        // If isInvoking we invoke the handler with the record
        let isInvoking = types.indexOf(record.eventName) > -1
        if (isInvoking) handler(record, callback)
        else callback() // If not we just call the continuation (callback)
      }
    })
    // Execute the handlers in parallel
    parallel(handlers, function __processedRecords (err, results) {
      if (err) ctx.fail(err)
      else ctx.succeed(results)
    })
  }
}


module.exports = {
  insert: __trigger.bind({}, [ 'INSERT' ]),
  modify: __trigger.bind({}, [ 'MODIFY' ]),
  update: __trigger.bind({}, [ 'MODIFY' ]),
  remove: __trigger.bind({}, [ 'REMOVE' ]),
  destroy: __trigger.bind({}, [ 'REMOVE' ]),
  all: __trigger.bind({}, [ 'INSERT', 'MODIFY', 'REMOVE' ]),
  save: __trigger.bind({}, [ 'INSERT', 'MODIFY' ]),
  change: __trigger.bind({}, [ 'INSERT', 'REMOVE' ]),
}
