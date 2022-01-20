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
  let name = process.env.SESSION_TABLE_NAME || tableLogicalId('arc-sessions')
  let secret = process.env.ARC_APP_SECRET || process.env.ARC_APP_NAME || 'fallback'
  // TODO: uppercase 'Cookie' is not the header name on AWS Lambda; it's
  // lowercase 'cookie' on lambda...
  let rawCookie = request.headers && (request.headers.cookie || request.headers.Cookie)
  // Lambda payload version 2 puts the cookies in an array on the request
  if (!rawCookie && request.cookies) {
    rawCookie = request.cookies.join(';')
  }

  let idx = getIdx(rawCookie)
  let sesh = cookie.parse(idx)._idx
  let valid = unsign(sesh || '', secret)

  // find or create a new session
  let exec = sesh && valid ? find.bind({}, name) : create.bind({}, name)
  let params = sesh && valid ? valid : {}

  exec(params, callback)
  return promise
}

/**
 * expect params to be
 * - _idx
 * - _secret
 */
function write (params, callback) {
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
  let name = process.env.SESSION_TABLE_NAME || tableLogicalId('arc-sessions')
  let secret = process.env.ARC_APP_SECRET || process.env.ARC_APP_NAME || 'fallback'

  update(name, params, function _update (err) {
    if (err) {
      callback(err)
    }
    else {
      let maxAge = process.env.SESSION_TTL || 7.884e+8
      let options = {
        maxAge,
        expires: new Date(Date.now() + maxAge * 1000),
        secure: true,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
      }
      if (process.env.SESSION_DOMAIN) {
        options.domain = process.env.SESSION_DOMAIN
      }
      if (process.env.ARC_ENV === 'testing') {
        delete options.secure
      }
      let result = cookie.serialize('_idx', sign(params._idx, secret), options)
      callback(null, result)
    }
  })

  return promise
}

function tableLogicalId (name) {
  let env = process.env.ARC_ENV === 'production' ? 'production' : 'staging'
  return `${process.env.ARC_APP_NAME}-${env}-${name}`
}
