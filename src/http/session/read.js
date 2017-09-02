var cookie = require('cookie')
var unsign = require('cookie-signature').unsign
var find = require('./_find')
var create = require('./_create')
var crsf = require('csrf')
var secret = process.env.ARC_APP_SECRET || process.env.ARC_APP_NAME || 'fallback'

module.exports = function _read(name, request, callback) {

  // adds request.session by cookie token lookup in dynamo
  var jar = cookie.parse(request.headers && request.headers.Cookie? request.headers.Cookie || '': '')
  var sesh = jar.hasOwnProperty('_idx')
  var valid = unsign(jar._idx || '', secret)

  var exec = sesh && valid? find.bind({}, name) : create.bind({}, name)
  var params = sesh && valid? valid : {}

  exec(params, function _find(err, payload) {

    if (err) {
      console.log(err)
      throw err
    }

    // tag the request w the session id and secret
    request._idx = payload._idx
    request._secret = payload._secret
    request.csrf = (new crsf).create(request._secret)

    // assign the session; clearing private vars
    request.session = payload

    delete payload._idx
    delete payload._ttl
    delete payload._secret

    callback(null, request)
  })
}
