var _response = require('./_response')
var _url = require('./helpers/_url')
var _static = require('./helpers/_static')
var session = require('./session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')
var csrf = require('csrf')
var fail = require('./_err')
var interpolate = require('./_interpolate-params')

module.exports = function arc(type, ...fns) {

  // validate everything passed is a function or blow up in the programmers face
  fns.forEach(f=> {
    if (typeof f != 'function') throw TypeError(f + ' not a function')
  })

  // return an aws lambda function signature
  return function _lambdaHandler(request, context, callback) {

    // API Gateway returns req.path as /foo/{baz} and req.params = {baz:'bazVal'}
    request = interpolate(request)

    // global exception/rejection handler
    // ensures whatever got thrown propagates through api gateway
    if (process.env.NODE_ENV != 'testing') {
      process.removeAllListeners('uncaughtException')
      process.removeAllListeners('unhandledRejection')
      process.on('uncaughtException', fail.bind({}, type, callback))
      process.on('unhandledRejection', fail.bind({}, type, callback))
    }

    // check for property configured api gateway
    if (!request.headers) {
      throw Error('gateway missing headers')
    }

    // cache the functions
    var fnsCache = fns.slice()

    session.read(request, function _read(err, request) {

      if (err) {
        console.log(err)
        throw err
      }

      // add a hidden helper to req for getting the correct staging or production url if dns isn't setup
      // var url = req._url('/count')
      Object.defineProperty(request, '_url', {
        value: _url.bind({}, request),
        enumerable: false
      })

      // adds a hidden helper for checking a csrf token
      var tokens = new csrf
      Object.defineProperty(request, '_verify', {
        value: (aToken)=> tokens.verify(request._secret, aToken),
        enumerable: false
      })

      // adds a hidden helper for getting the static assets path
      var tokens = new csrf
      Object.defineProperty(request, '_static', {
        value: _static,
        enumerable: false
      })

      // construct a response function
      var response = _response.bind({}, type, request, callback)

      // loop thru middleware
      ;(function _iter(fn) {
        var next = _iter.bind({}, fnsCache.shift() || function _nope(){throw Error('next called from last arc function')})
        fn.call({}, request, response, next)
      })(fnsCache.shift())
    })
  //-end of aws fn sig
  }
//- end of module
}
