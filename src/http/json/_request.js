var querystring = require('querystring')
var _response = require('./_response')
var session = require('../session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')

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
    var cookies = request.headers.Cookie || ''
    var jar = cookies.split(';').map(c=> c.split('='))
    var sesh = jar.find(c=> c[0] === '_idx')
    var exec = sesh? session.find : session.create
    var params = sesh? sesh[1] : {}

    exec(params, function _find(err, payload) {
      if (err) {
        throw err
      }
      else {
        // fix the body
        request.body = querystring.parse(request.body)

        // tag the request w the session id
        request._idx = payload._idx

        // assign the session; clearing private vars
        request.session = payload
        delete payload._idx
        delete payload._ttl

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
