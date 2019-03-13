let read = require('./session/read')
let write = require('./session/write')
let interpolate = require('./helpers/params')

/**
 * arc.http accepts one or more functions with an express-style sig
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
      throw Error('gateway missing headers')

    // cache the functions
    let cache = fns.slice()

    // read the session
    read(request, function _read(err, session) {

      // fail loudly if the session isn't setup correctly
      if (err)
        throw err

      // construct a response function
      let req = interpolate(Object.assign({}, request, {session}))
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
 * params can be
 * - session
 * - location
 * - html, css, js, text, json or xml
 * - status, code, or statusCode
 * - cacheControl
 */
function response(req, callback, params) {
  let res = params
  // default content type, body, cache-control
  res.type = 'application/json; charset=utf8'
  res.body = params.body || '\n'
  res.cacheControl = params.cacheControl || ''
  // shorthand overrides
  if (params instanceof Error) {
    res.status = params.status || params.code || 500
    res.type = 'text/html; charset=utf8'
    res.body = `
      <h1>${params.name} ${res.status}</h1>
      <h3>${params.message}</h3>
      <pre>${params.stack}<pre>
    `
  }
  if (params.location) {
    // auto add 302 to status
    res.status = 302
  }
  if (params.html) {
    res.type = 'text/html; charset=utf8'
    res.body = params.html
  }
  else if (params.css) {
    res.type = 'text/css; charset=utf8'
    res.body = params.css
  }
  else if (params.js) {
    res.type = 'text/javascript; charset=utf8'
    res.body = params.js
  }
  else if (params.text) {
    res.type = 'text/plain; charset=utf8'
    res.body = params.text
  }
  else if (params.json) {
    res.type = 'application/json; charset=utf8'
    res.body = JSON.stringify(params.json)
  }
  else if (params.xml) {
    res.type = 'application/xml; charset=utf8'
    res.body = params.xml
  }
  // fixes for proxy+ greedy catchall at root route
  res.headers = {'content-type':res.type}
  res.statusCode = res.status || res.code || res.statusCode
  // tag the new session
  if (res.session) {
    let session = res.session
    session._idx = req.session._idx
    session._secret = req.session._secret
    session._ttl = req.session._ttl
    // save the session
    write(session, function _write(err, cookie) {
      if (err) throw err
      let merged = Object.assign({}, res, {cookie})
      callback(null, merged)
    })
  }
  else {
    // just passthru
    callback(null, res)
  }
}
