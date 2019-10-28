let sandbox = require('./send-sandbox')
let run = require('./send')

/**
 * arc.ws.send
 *
 * publish web socket events
 *
 * @param {Object} params
 * @param {String} params.id - the ws connecton id (required)
 * @param {String} params.payload - a json event payload (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
module.exports = function send({id, payload}, callback) {

  // create a promise if no callback is defined
  let promise
  if (!callback) {
    promise = new Promise(function(res, rej) {
      callback = function(err, result) {
        err ? rej(err) : res(result)
      }
    })
  }

  let local = process.env.NODE_ENV === 'testing' || process.env.ARC_LOCAL
  let exec = local ? sandbox : run

  exec({
    id,
    payload
  }, callback)

  return promise
}
