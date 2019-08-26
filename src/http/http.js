let read = require('./session/read')
let write = require('./session/write')
let bodyParser = require('./helpers/body-parser')
let interpolate = require('./helpers/params')
let responseFormatter = require('./_res-fmt')

/**
 * `arc.http` accepts one or more functions with an express-style sig
 */
module.exports = function http(...fns) {

  // ensure we have been passed only functions
  fns.forEach(f=> {
    if (typeof f != 'function')
      throw TypeError(f + ' not a function')
  })

  // return an aws lambda function signature
  return function lambda(request, context, callback) {

    // verify the request is configured by arc
    if (!request.headers)
      request.headers = {}

    // cache the functions
    let cache = fns.slice()

    // read the session
    read(request, function _read(err, session) {

      // fail loudly if the session isn't setup correctly
      if (err)
        throw err

      // construct a response function
      let req = interpolate(Object.assign({}, request, {session}))
      req.body = bodyParser(req)
      let res = response.bind({}, req, callback)

      // loop thru middleware
      ;(function iterator(fun) {
        function fail() {throw Error('next() called from last function')}
        let next = iterator.bind({}, cache.shift() || fail)
        fun.call({}, req, res, next)
      })(cache.shift())
    })
  }
}

/**
 * req is bound so we have a ref to req.session
 * callback is raw lambda callback
 */
function response(req, callback, params) {
  // Format the response
  let res = responseFormatter(params)

  // Tag the new session
  if (params.session || params.cookie) {
    let session = params.session || params.cookie
    session = Object.assign({}, req.session, session)
    // Save the session
    write(session, function _write(err, cookie) {
      if (err) callback(err)
      else {
        res.headers['Set-Cookie'] = cookie
        callback(null, res)
      }
    })
  }
  else {
    // Just pass it through
    callback(null, res)
  }
}
