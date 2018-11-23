let cookie = require('cookie')
let jwt = require('node-webtokens');
let alg = 'dir'
let enc = 'A128GCM'

// min key size is 16
let fallback = Buffer.from('0000000000000000').toString('base64')

// need to STRONGLY encourage setting ARC_APP_SECRET in the docs
let key = process.env.ARC_APP_SECRET || fallback

// wrapper for jwe.create/jwe.parse
let jwe = {
  create(payload) {
    return jwt.generate(alg, enc, payload, key)
  },
  parse(token) {
    return jwt.parse(token).verify(key)
  }
}

/**
 * reads req cookie and returns token payload or an empty object
 */
function read(req) {
  let hasCookie = req.headers && req.headers.Cookie
  let jar = cookie.parse(hasCookie? req.headers.Cookie : '')
  let token = jwe.parse(jar._idx)
  return token.payload || {}
}

/**
 * creates a Set-Cookie header with token payload encrypted
 */
function write(payload) {
  let key = '_idx'
  let val = jwe.create(payload)
  let maxAge = Date.now() + 7.884e+11
  return cookie.serialize(key, val, {
    maxAge,
    expires: new Date(maxAge),
    secure: true,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })
}

module.exports = {read, write}
