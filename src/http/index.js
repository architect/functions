const read = require('./session/read')
const write = require('./session/write')
const bodyParser = require('./helpers/body-parser')
const interpolate = require('./helpers/params')
const url = require('./helpers/url')
const responseFormatter = require('./_res-fmt')
const create = require('./csrf/create')
const verify = require('./csrf/verify')

// Unified async / callback HTTP handler
function httpHandler(isAsync, ...fns) {
  // Ensure we've been passed only functions
  fns.forEach((fn) => {
    if (typeof fn !== 'function') throw TypeError(`${fn} not a function`)
  })
  // Override arc.http using callbacks by passing async functions
  isAsync = isAsync || fns[0].constructor.name === 'AsyncFunction'

  if (isAsync) {
    // Return an AWS Lambda async function signature
    return async function lambda(request, context) {
      let params
      let first = true
      for (const fn of fns) {
        if (fn.constructor.name !== 'AsyncFunction') {
          throw TypeError('All arc.http middleware functions must be async')
        }

        // Only parse the request obj of the first function
        if (first) {
          first = false
          const session = await read(request)
          const req = interpolate(Object.assign(request, { session }))
          req.body = bodyParser(req)
          request = req
        }
        // Run the function
        const result = await fn(request, context)
        const isRequest = result?.httpMethod
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
      const isHTTPv2 = request?.version === '2.0'
      // Finished combined function!
      if (!params && !isHTTPv2) {
        throw new Error('Finished all functions without returning a response.')
      }
      return asyncResponse(request, params)
    }
  }
  // Return an AWS Lambda continuation passing function signature
  return function lambda(request, context, callback) {
    // Cache the functions
    const cache = fns.slice()

    // read the session
    read(request, function _read(err, session) {
      // Fail loudly if the session isn't set up correctly
      if (err) throw err

      // Construct a response function
      const req = interpolate(Object.assign(request, { session }))
      req.body = bodyParser(req)
      const res = response.bind({}, req, callback)

      // Loop through middleware
      function fail() {
        throw Error('next() called from last function')
      }
      ;(function iterator(fn) {
        if (fn.constructor.name !== 'Function') {
          throw TypeError('All arc.http middleware functions must be continuation passing (callback)')
        }

        const next = iterator.bind({}, cache.shift() || fail)
        fn.call({}, req, res, next)
      })(cache.shift())
    })
  }
}
const http = httpHandler.bind({}, false)
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
async function asyncResponse(req, params) {
  // Format the response
  const res = responseFormatter(req, params)

  // Legacy 'cookie' parameter, used after direct session writes
  if (params?.cookie) {
    res.headers['set-cookie'] = params.cookie
  }

  // Save the passed session
  if (params?.session) {
    // Tag the session data with _idx, secret, ttl, from req.session
    const { _idx, _secret, _ttl } = req.session
    const session = { _idx, _secret, _ttl, ...params.session }
    const cookie = await write(session)
    res.headers['set-cookie'] = cookie
  }
  return res
}

function response(req, callback, params) {
  // Format the response
  const res = responseFormatter(req, params)

  // Legacy 'cookie' parameter, used after direct session writes
  if (params?.cookie) {
    res.headers['set-cookie'] = params.cookie
  }

  // Save the passed session
  if (params?.session) {
    // Tag the session data with _idx, secret, ttl, from req.session
    const { _idx, _secret, _ttl } = req.session
    const session = { _idx, _secret, _ttl, ...params.session }
    write(session, function _write(err, cookie) {
      if (err) callback(err)
      else {
        res.headers['set-cookie'] = cookie
        callback(null, res)
      }
    })
  } else {
    // Just pass it through
    callback(null, res)
  }
}
