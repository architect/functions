var crsf = require('csrf')
var tokens = new csrf

module.exports = function _csrf(req, res, next) {
  var valid = tokens.verify(req._secret, req.body.csrf)
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
