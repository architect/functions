var csrf = require('csrf')
var tokens = new csrf

module.exports = function _csrf(req, res, next) {
  var token = req.body && req.body.csrf? req.body.csrf : ''
  var valid = tokens.verify(req._secret, token)
  if (valid) {
    next()
  }
  else {
    res({
      status: 403,
      html: 'invalid csrf token'
    })
  }
}
