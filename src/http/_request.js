var _response = require('./_response')
var _url = require('./helpers/_url')
var session = require('./session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')

module.exports = function arc(type, ...fns) {

  // while not neccessary this documents whats going on 
  var supported = ['text/html', 'text/css', 'text/javascript', 'application/json']
  if (!supported.includes(type)) throw SyntaxError(`Unsupported type "${type}"`)

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

    session.read(request, function _read(err, request) {
      if (err) throw err
      
      // add a hidden helper to req for getting the correct staging or production url if dns isn't setup
      // var url = req._url('/count') 
      Object.defineProperty(request, '_url', {
        value: _url.bind({}, request), 
        enumerable: false
      })

      // adds a hidden helper for checking a csrf token
      Object.defineProperty(request, '_verify', {
        value: (aToken)=> tokens.verify(request._secret, aToken), 
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
