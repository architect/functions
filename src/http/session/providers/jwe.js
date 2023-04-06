let getIdx = require('./_get-idx')
let cookie = require('cookie')
let jwt = require('node-webtokens')
let alg = 'dir'
let enc = 'A128GCM'

// 128bit key size
let fallback = Buffer.from('1234567890123456').toString('base64')

// need to STRONGLY encourage setting ARC_APP_SECRET in the docs
let key = process.env.ARC_APP_SECRET || fallback

// wrapper for jwe.create/jwe.parse
let jwe = {
  create (payload) {
    return jwt.generate(alg, enc, payload, key)
  },
  parse (token) {
    const WEEK = 604800
    return jwt.parse(token).setTokenLifetime(WEEK).verify(key)
  }
}

/**
 * reads req cookie and returns token payload or an empty object
 */
function read (req, callback) {
  let promise
  if (!callback) {
    promise = new Promise(function argh (res, rej) {
      callback = function errback (err, result) {
        err ? rej(err) : res(result)
      }
    })
  }
  let rawCookie = req.headers?.cookie || req.headers?.Cookie
  // Lambda payload version 2 puts the cookies in an array on the request
  if (!rawCookie && req.cookies) {
    rawCookie = req.cookies.join(';')
  }

  let idx = getIdx(rawCookie)
  let sesh = cookie.parse(idx)._idx
  let token = jwe.parse(sesh)
  callback(null, token.valid ? token.payload : {})
  return promise
}

/**
 * creates a Set-Cookie header with token payload encrypted
 */
function write (payload, callback) {
  let {
    ARC_ENV,
    ARC_SESSION_DOMAIN, SESSION_DOMAIN,
    ARC_SESSION_SAME_SITE,
    ARC_SESSION_TTL, SESSION_TTL,
  } = process.env
  let promise
  if (!callback) {
    promise = new Promise(function ugh (res, rej) {
      callback = function errback (err, result) {
        err ? rej(err) : res(result)
      }
    })
  }
  let key = '_idx'
  let val = jwe.create(payload)
  let maxAge = ARC_SESSION_TTL || SESSION_TTL || 7.884e+8
  let sameSite = ARC_SESSION_SAME_SITE || 'lax'
  let options = {
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
    secure: true,
    httpOnly: true,
    path: '/',
    sameSite,
  }
  if (ARC_SESSION_DOMAIN || SESSION_DOMAIN) {
    options.domain = ARC_SESSION_DOMAIN || SESSION_DOMAIN
  }
  if (ARC_ENV === 'testing') {
    delete options.secure
  }
  callback(null, cookie.serialize(key, val, options))
  return promise
}

module.exports = { read, write }
