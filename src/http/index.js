let read = require('./session/read')
let write = require('./session/write')
let bodyParser = require('./helpers/body-parser')
let interpolate = require('./helpers/params')
let url = require('./helpers/url')
let responseFormatter = require('./_res-fmt')
let create = require('./csrf/create')
let verify = require('./csrf/verify')

// Unified async / callback HTTP handler
function httpHandler (isAsync, ...fns) {

  // Ensure we've been passed only functions
  fns.forEach(fn => {
    if (typeof fn !== 'function') throw TypeError(fn + ' not a function')
  })
  // Override arc.http using callbacks by passing async functions
  isAsync = isAsync || fns[0].constructor.name === 'AsyncFunction'

  if (isAsync) {
    // Return an AWS Lambda async function signature
    return async function lambda (request, context) {
      let params
      let first = true
      for (let fn of fns) {
        if (fn.constructor.name !== 'AsyncFunction') {
          throw TypeError('All arc.http middleware functions must be async')
        }

        // Only parse the request obj of the first function
        if (first) {
          first = false
          let session = await read(request)
          let req = interpolate(Object.assign(request, { session }))
          req.body = bodyParser(req)
          request = req
        }
        // Run the function
        let result = await fn(request, context)
        let isRequest = result?.httpMethod
        // Function returned a modified request, continuing...
        if (isRequest) request = result
        else {
          if (result) {
            params = result
            // Got a response, finishing...
            break
          }
          // Did not get a result from, continuing...
        }
      }
      let isHTTPv2 = request?.version === '2.0'
      // Finished combined function!
      if (!params && !isHTTPv2) {
        throw new Error(`Finished all functions without returning a response.`)
      }
      return asyncResponse(request, params)
    }
  }
  else {
    // Return an AWS Lambda continuation passing function signature
    return function lambda (request, context, callback) {

      // Cache the functions
      let cache = fns.slice()

      // read the session
      read(request, function _read (err, session) {
        // Fail loudly if the session isn't set up correctly
        if (err) throw err

        // Construct a response function
        let req = interpolate(Object.assign(request, { session }))
        req.body = bodyParser(req)
        let res = response.bind({}, req, callback)

        // Loop through middleware
        function fail () { throw Error('next() called from last function') }
        (function iterator (fn) {
          if (fn.constructor.name !== 'Function') {
            throw TypeError('All arc.http middleware functions must be continuation passing (callback)')
          }

          let next = iterator.bind({}, cache.shift() || fail)
          fn.call({}, req, res, next)
        })(cache.shift())
      })
    }
  }
}
let http = httpHandler.bind({}, false)
http.async = httpHandler.bind({}, true)

// Helpers
http.helpers = { bodyParser, interpolate, url }

// Session
http.session = { read, write }

// CSRF
http.csrf = { create, verify }

module.exports = http

/**
 * Response formatter & session helpers
 */
async function asyncResponse (req, params) {
  // Format the response
  let res = responseFormatter(req, params)

  // Legacy 'cookie' parameter, used after direct session writes
  if (params && params.cookie) {
    res.headers['set-cookie'] = params.cookie
  }

  // Save the passed session
  if (params?.session) {
    // Tag the session data with _idx, secret, ttl, from req.session
    let { _idx, _secret, _ttl } = req.session
    let session = { _idx, _secret, _ttl, ...params.session }
    let cookie = await write(session)
    res.headers['set-cookie'] = cookie
  }
  return res
}

function response (req, callback, params) {
  // Format the response
  let res = responseFormatter(req, params)

  // Legacy 'cookie' parameter, used after direct session writes
  if (params?.cookie) {
    res.headers['set-cookie'] = params.cookie
  }

  // Save the passed session
  if (params?.session) {
    // Tag the session data with _idx, secret, ttl, from req.session
    let { _idx, _secret, _ttl } = req.session
    let session = { _idx, _secret, _ttl, ...params.session }
    write(session, function _write (err, cookie) {
      if (err) callback(err)
      else {
        res.headers['set-cookie'] = cookie
        callback(null, res)
      }
    })
  }
  else {
    // Just pass it through
    callback(null, res)
  }
}
