module.exports = function _csrf(req, res, next) {
  const token = req.body?.csrf ? req.body.csrf : ''
  const valid = req._verify(token)
  if (valid) {
    next()
  } else {
    res({
      status: 403,
      html: 'invalid csrf token',
    })
  }
}
