let cookie = require('cookie')
let getIdx = require('../_get-idx')
let { unsign, sign } = require('cookie-signature')

let discovery = require('../../../../discovery')
let find = require('./find')
let create = require('./create')
let update = require('./update')
let sessionTable

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
    let rawCookie = request.headers?.cookie || request.headers?.Cookie
    // Lambda payload version 2 puts the cookies in an array on the request
    if (!rawCookie && request.cookies) {
      rawCookie = request.cookies.join(';')
    }

    let idx = getIdx(rawCookie)
    let sesh = cookie.parse(idx)._idx
    let valid = unsign(sesh || '', secret)

    function findOrCreate (err) {
      if (err) return callback(err)

      // Find or create a new session
      let exec = sesh && valid ? find.bind({}, sessionTable) : create.bind({}, sessionTable)
      let params = sesh && valid ? valid : {}

      exec(params, callback)
    }
    if (sessionTable) findOrCreate()
    else getSessionTable(name, findOrCreate)
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
    ARC_SESSION_DOMAIN, SESSION_DOMAIN,
    ARC_SESSION_SAME_SITE,
    ARC_SESSION_TTL, SESSION_TTL,
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

  // Read DynamoDB session table
  let name = ARC_SESSION_TABLE_NAME || SESSION_TABLE_NAME
  if (name) {
    let secret = ARC_APP_SECRET || ARC_APP_NAME || 'fallback'

    function updateSession (err) {
      if (err) return callback(err)

      update(sessionTable, params, function _update (err) {
        if (err) return callback(err)

        let twentyFiveYears = 7.884e+8
        let maxAge = Number(ARC_SESSION_TTL || SESSION_TTL || twentyFiveYears)
        let sameSite = ARC_SESSION_SAME_SITE || 'lax'
        let options = {
          maxAge,
          expires: new Date(Date.now() + (maxAge * 1000)),
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
        let result = cookie.serialize('_idx', sign(params._idx, secret), options)
        callback(null, result)
      })
    }

    if (sessionTable) updateSession()
    else getSessionTable(name, updateSession)
  }
  else callback()

  return promise
}

function getSessionTable (name, callback) {
  discovery((err, services) => {
    if (err) callback(err)
    else {
      let { tables = {} } = services
      // Tables services: key would be logical table name, value would be physical
      sessionTable = tables[name] || Object.values(tables).find(v => v === name)

      if (!sessionTable) {
        let err = ReferenceError(`Session table name '${name}' could not be found`)
        callback(err)
      }
      else callback()
    }
  })
}
