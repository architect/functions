var session = require('../session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')

module.exports = function response(request, callback, cmds) {

  // ensure only valid command keys
  var allowed = ['location', 'session', 'html']
  Object.keys(cmds).forEach(k=> {
    if (!allowed.includes(k)) {
      throw Error(k + ' unknown key. Only location, session and html allowed')
    }
  })

  // ensure not both location and html
  var hasLocationAndHtml = cmds.hasOwnProperty('location') && cmds.hasOwnProperty('html')
  if (hasLocationAndHtml) {
    throw Error('Found location and html keys; only one is allowed')
  }
  // ensure one of location or html
  var hasOneOfLocationOrHtml = cmds.hasOwnProperty('location') || cmds.hasOwnProperty('html')
  if (!hasOneOfLocationOrHtml) {
    throw Error('response must have location or html')
  }

  var sesh = Object.assign(cmds.session || request.session, {_idx:request._idx})
  session.update(sesh, function _update(err) {
    if (err) {
      throw err
    }
    else {
      // write the session cookie
      cmds.cookie = `_idx=${request._idx}; httpOnly`

      if (request.method.toLowerCase() === 'post') {
        // always a 302; mapping templtes look for location key
        callback(null, cmds)
      }
      else {
        // we need to hijack api gateway error to create a statusCode 302
        // not a real error mind you; but a string
        if (cmds.location) {
          callback(cmds.location)
        }
        else {
          callback(null, cmds)
        }
      }
    }
  })
}
