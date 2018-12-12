let csrf = require('./helpers/_csrf')
let req = require('./_request')
let read = require('./_session-read')
let write = require('./_session-write')
let static = require('./helpers/_static')
let interpolate = require('./_interpolate-params')
let url = require('./_url') // NEW no magic

/**
 * arc.http accepts one or more functions with an express-style sig
 */
function http(...fns) {

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
    //console.log('got request', request)
    read(request, function _read(err, session) {
      //console.log('got session', session)

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
 * - status or code
 */
function response(req, callback, params) {
  let commands = params
  // default content type and body
  commands.type = 'application/json; charset=utf8'
  commands.body = params.body || '\n'
  // shorthand overrides
  if (params instanceof Error) {
    commands.status = params.status || params.code || 500
    commands.type = 'text/html; charset=utf8'
    commands.body = `
      <h1>${params.name} ${commands.status}</h1>
      <h3>${params.message}</h3>
      <pre>${params.stack}<pre>
    `
  }
  if (params.location) {
    // auto add 302 to status
    commands.status = 302
  }
  if (params.html) {
    commands.type = 'text/html; charset=utf8'
    commands.body = params.html
  }
  else if (params.css) {
    commands.type = 'text/css; charset=utf8'
    commands.body = params.css
  }
  else if (params.js) {
    commands.type = 'text/javascript; charset=utf8'
    commands.body = params.js
  }
  else if (params.text) {
    commands.type = 'text/plain; charset=utf8'
    commands.body = params.text
  }
  else if (params.json) {
    commands.type = 'application/json; charset=utf8'
    commands.body = JSON.stringify(params.json)
  }
  else if (params.xml) {
    commands.type = 'application/xml; charset=utf8'
    commands.body = params.xml
  }
  if (commands.session) {
    // tag the new session
    let session = commands.session
    session._idx = req.session._idx
    session._secret = req.session._secret
    session._ttl = req.session._ttl
    // save the session
    write(session, function _write(err, cookie) {
      if (err) throw err
      let merged = Object.assign({}, commands, {cookie})
      callback(null, merged)
    })
  }
  else {
    // just passthru
    callback(null, commands)
  }
}

http.helpers = {
  static,
  url,
  interpolate,
}

http.session = {
  read,
  write,
}

// DEPRECATED:
http.html = {
  csrf,
  get: req.bind({}, 'text/html'),
  post: req.bind({}, 'text/html'),
}
http.json = {
  get: req.bind({}, 'application/json'),
  post: req.bind({}, 'application/json'),
  put: req.bind({}, 'application/json'),
  delete: req.bind({}, 'application/json'),
  patch: req.bind({}, 'application/json'),
}
http.css = {
  get: req.bind({}, 'text/css'),
}
http.js = {
  get: req.bind({}, 'text/javascript'),
}
http.text = {
  get: req.bind({}, 'text/plain'),
}
http.xml = {
  get: req.bind({}, 'application/xml'),
  post: req.bind({}, 'application/xml'),
  put: req.bind({}, 'application/xml'),
  delete: req.bind({}, 'application/xml'),
  patch: req.bind({}, 'application/xml'),
}

module.exports = http
