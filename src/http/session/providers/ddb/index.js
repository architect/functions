let cookie = require('cookie')
let getIdx = require('../_get-idx')
let { unsign, sign } = require('cookie-signature')

let find = require('./find')
let create = require('./create')
let update = require('./update')

module.exports = { read, write }

/**
 * reads request for session cookie and looks it up in dynamo
 */
function read (request, callback) {
  let {
    ARC_APP_NAME,
    ARC_APP_SECRET,
    ARC_SESSION_TABLE_NAME, SESSION_TABLE_NAME,
  } = process.env

  // be async/await friendly
  let promise
  if (!callback) {
    promise = new Promise(function (res, rej) {
      callback = function (err, result) {
        err ? rej(err) : res(result)
      }
    })
  }

  // read dynamo session table
  let name = ARC_SESSION_TABLE_NAME || SESSION_TABLE_NAME
  if (name) {
    let secret = ARC_APP_SECRET || ARC_APP_NAME || 'fallback'
    // TODO: uppercase 'Cookie' is not the header name on AWS Lambda; it's
    // lowercase 'cookie' on lambda...
    let rawCookie = request.headers?.cookie || request.headers?.Cookie
    // Lambda payload version 2 puts the cookies in an array on the request
    if (!rawCookie && request.cookies) {
      rawCookie = request.cookies.join(';')
    }

    let idx = getIdx(rawCookie)
    let sesh = cookie.parse(idx)._idx
    let valid = unsign(sesh || '', secret)

    // Find or create a new session
    let exec = sesh && valid ? find.bind({}, name) : create.bind({}, name)
    let params = sesh && valid ? valid : {}

    exec(params, callback)
  }
  else callback()

  return promise
}

/**
 * expect params to be
 * - _idx
 * - _secret
 */
function write (params, callback) {
  let {
    ARC_APP_NAME,
    ARC_APP_SECRET,
    ARC_ENV,
    ARC_SESSION_TABLE_NAME, SESSION_TABLE_NAME,
    ARC_SESSION_TTL, SESSION_TTL,
    ARC_SESSION_DOMAIN, SESSION_DOMAIN,
  } = process.env

  // be async/await friendly
  let promise
  if (!callback) {
    promise = new Promise(function (res, rej) {
      callback = function (err, result) {
        err ? rej(err) : res(result)
      }
    })
  }

  // read dynamo session table
  // TODO / FIXME I think this no longer works?
  let name = ARC_SESSION_TABLE_NAME || SESSION_TABLE_NAME
  if (name) {
    let secret = ARC_APP_SECRET || ARC_APP_NAME || 'fallback'
    update(name, params, function _update (err) {
      if (err) {
        callback(err)
      }
      else {
        let maxAge = ARC_SESSION_TTL || SESSION_TTL || 7.884e+8
        let options = {
          maxAge,
          expires: new Date(Date.now() + maxAge * 1000),
          secure: true,
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
        }
        if (ARC_SESSION_DOMAIN || SESSION_DOMAIN) {
          options.domain = ARC_SESSION_DOMAIN || SESSION_DOMAIN
        }
        if (ARC_ENV === 'testing') {
          delete options.secure
        }
        let result = cookie.serialize('_idx', sign(params._idx, secret), options)
        callback(null, result)
      }
    })
  }
  else {
    callback()
  }

  return promise
}
