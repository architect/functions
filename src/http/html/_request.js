var cookie = require('cookie')
var _response = require('./_response')
var _url = require('../_url')
var session = require('../session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')
var unsign = require('cookie-signature').unsign
var secret = process.env.ARC_APP_SECRET || process.env.ARC_APP_NAME || 'fallback'
var crsf = require('csrf')
var tokens = new crsf

module.exports = function arc(...fns) {

  // validate everything passed is a function or blow up in the programmers face
  fns.forEach(f=> {
    if (typeof f != 'function') throw TypeError(f + ' not a function')
  })

  // return an aws lambda function signature
  return function _lambdaHandler(request, context, callback) {

    if (!request.headers) {
      throw Error('gateway missing headers')
    }

    // cache the functions
    var fnsCache = fns.slice()

    // adds request.session by cookie token lookup in dynamo
    var jar = cookie.parse(request.headers.Cookie || '')
    var sesh = jar.hasOwnProperty('_idx')
    var valid = unsign(jar._idx || '', secret)

    var exec = sesh && valid? session.find : session.create
    var params = sesh && valid? valid : {}

    exec(params, function _find(err, payload) {
      if (err) {
        throw err
      }
      else {
        // tag the request w the session id and secret
        request._idx = payload._idx
        request._secret = payload._secret
        request.csrf = tokens.create(request._secret)

        // assign the session; clearing private vars
        request.session = payload
        delete payload._idx
        delete payload._ttl
        delete payload._secret

        // add a hidden helper to req for getting the correct staging or production url if dns isn't setup
        // var url = req._url('/count') 
        Object.defineProperty(request, '_url', {
          value: _url.bind({}, request), 
          enumerable: false
        })

        // construct a response function
        var response = _response.bind({}, request, callback)

        // loop thru middleware
        ;(function _iter(fn) {
          var next = _iter.bind({}, fnsCache.shift() || function _nope(){throw Error('next called from last arc function')})
          fn.call({}, request, response, next)
        })(fnsCache.shift())
      }
    })
  //-end of aws fn sig
  }
//- end of module
}
