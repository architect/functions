let cookie = require('cookie')
let unsign = require('cookie-signature').unsign
let find = require('./session/_find')
let create = require('./session/_create')

module.exports = function read(request, callback) {

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
  let jar = cookie.parse(request.headers && request.headers.Cookie? request.headers.Cookie || '': '')
  let sesh = jar.hasOwnProperty('_idx')
  let valid = unsign(jar._idx || '', secret)

  // find or create a new session
  let exec = sesh && valid? find.bind({}, name) : create.bind({}, name)
  let params = sesh && valid? valid : {}

  exec(params, callback)
  return promise
}
