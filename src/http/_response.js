var session = require('./session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')
var validate = require('./_validate')
var fmt = require('./_fmt')

module.exports = function response(type, request, callback, cmds) {

  validate(type, cmds)

  session.write({
    request,
    cmds
  },
  function _sync(err, res) {
    if (err) throw err

    if (res.location) {
      callback(res.location)
    }
    else if (!res.status || res.status === 200) {
      callback(null, res)
    }
    else if (res.status) {
      callback(fmt(res))
    }
    else {
      callback(null, res) 
    }
  })
}
