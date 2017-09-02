var session = require('./session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')
var validate = require('./validate')
var fmt = require('./_fmt')

module.exports = function _response(type, request, callback, cmds) {
  session.write({
    cmds: validate(type, cmds),
    request,
  },
  function _write(err, res) {
    if (err) {
      console.log(err)
      throw err
    }
    else if (res.location) {
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
