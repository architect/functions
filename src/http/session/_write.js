var cookie = require('cookie')
var sign = require('cookie-signature').sign
var secret = process.env.ARC_APP_SECRET || process.env.ARC_APP_NAME || 'fallback'
var update = require('./_update')

module.exports = function _cookie(params, callback) {
  var {request, cmds} = params
  var sesh = Object.assign(cmds.session || request.session, {
    _idx: request._idx, 
    _secret: request._secret
  })
  update(sesh, function _update(err) {
    if (err) throw err
    cmds.cookie = cookie.serialize('_idx', sign(request._idx, secret), {
      maxAge: Date.now() + 7.884e+11,
      expires: new Date(maxAge),
      secure: true,
      httpOnly: true
    })
    callback(null, cmds)
  }
}
