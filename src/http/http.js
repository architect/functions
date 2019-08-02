let read = require('./session/read')
let write = require('./session/write')
let bodyParser = require('./helpers/body-parser')
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
 * params can be
 * - session
 * - location
 * - html, css, js, text, json or xml
 * - status, code, or statusCode
 * - cacheControl
 */
function response(req, callback, params) {
  let isError = params instanceof Error
  if (!isError) params = JSON.parse(JSON.stringify(params)) // Deep copy to aid testing mutation

  /**
   * Response defaults
   *   where possible, normalize headers to pascal-kebab case (lolsigh)
   */
  // Body
  let body = params.body || '\n'

  // Headers: Cache-Control
  let cacheControl = params.cacheControl ||
                     params.headers && params.headers['Cache-Control'] ||
                     params.headers && params.headers['cache-control'] || ''
  if (params.headers && params.headers['cache-control'])
    delete params.headers['cache-control'] // Clean up improper casing

  // Headers: Content-Type
  let type = params.type ||
             params.headers && params.headers['Content-Type'] ||
             params.headers && params.headers['content-type'] ||
             'application/json; charset=utf8'
  if (params.headers && params.headers['content-type'])
    delete params.headers['content-type'] // Clean up improper casing

  // Cross-origin ritual sacrifice
  let cors = params.cors

  // Status
  let providedStatus = params.status || params.code || params.statusCode
  let status = providedStatus || 200

  // shorthand overrides
  if (isError) {
    status = providedStatus || 500
    type = 'text/html; charset=utf8'
    body = `
      <h1>${params.name} ${status}</h1>
      <h3>${params.message}</h3>
      <pre>${params.stack}<pre>
    `
  }

  if (params.html) {
    type = 'text/html; charset=utf8'
    body = params.html
  }
  else if (params.css) {
    type = 'text/css; charset=utf8'
    body = params.css
  }
  else if (params.js) {
    type = 'text/javascript; charset=utf8'
    body = params.js
  }
  else if (params.text) {
    type = 'text/plain; charset=utf8'
    body = params.text
  }
  else if (params.json) {
    type = 'application/json; charset=utf8'
    body = JSON.stringify(params.json)
  }
  else if (params.xml) {
    type = 'application/xml; charset=utf8'
    body = params.xml
  }

  let res = {
    headers: Object.assign({}, {'Content-Type': type}, params.headers || {}),
    statusCode: status,
    body
  }

  // Set and/or update headers
  let headers = res.headers
  if (cacheControl) headers['Cache-Control'] = cacheControl
  let antiCache = type.includes('text/html') ||
                  type.includes('application/json')
  if (headers && !headers['Cache-Control'] && antiCache) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
  }
  if (cors) headers['Access-Control-Allow-Origin'] = '*'
  if (params.isBase64Encoded) res.isBase64Encoded = true
  if (params.location) {
    res.statusCode = 302
    res.headers.location = params.location
  }

  // tag the new session
  if (params.session || params.cookie) {
    let session = params.session || params.cookie
    session = Object.assign({}, req.session, session)
    // save the session
    write(session, function _write(err, cookie) {
      if (err) throw err
      res.headers['Set-Cookie'] = cookie
      callback(null, res)
    })
  }
  else {
    // just passthru
    callback(null, res)
  }
}
