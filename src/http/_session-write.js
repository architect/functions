let cookie = require('cookie')
let sign = require('cookie-signature').sign
let update = require('./session/_update')

/**
 * expect params to be
 * - _idx
 * - _secret
 */
module.exports = function _write(params, callback) {

  // be async/await friendly
  let promise
  if (!callback) {
    promise = new Promise(function(res, rej) {
      callback = function(err, result) {
        err ? rej(err) : res(result)
      }
    })
  }

  // read dynamo session table
  let name = process.env.SESSION_TABLE_NAME || 'arc-sessions'
  let secret = process.env.ARC_APP_SECRET || process.env.ARC_APP_NAME || 'fallback'

  update(name, params, function _update(err) {
    if (err) {
      callback(err)
    }
    else {
      let maxAge = Date.now() + 7.884e+11
      let result = cookie.serialize('_idx', sign(params._idx, secret), {
        maxAge,
        expires: new Date(maxAge),
        secure: true,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
      })
      callback(null, result)
    }
  })

  return promise
}
