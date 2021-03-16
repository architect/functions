let sandbox = require('./publish-sandbox')

/**
 * invoke a queue lambda by sqs queue name
 */
module.exports = function publishFactory (services) {
  let queue = require('./publish-queue')(services)
  return function publish (params, callback) {

    if (!params.name)
      throw ReferenceError('missing params.name')

    if (!params.payload)
      throw ReferenceError('missing params.payload')

    let promise
    if (!callback) {
      promise = new Promise((resolve, reject) => {
        callback = function errback (err, result) {
          err ? reject(err) : resolve(result)
        }
      })
    }

    let isLocal = process.env.NODE_ENV === 'testing' || process.env.ARC_LOCAL
    let exec = isLocal ? sandbox : queue
    exec(params, callback)
    return promise
  }
}
