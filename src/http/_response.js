var session = require('../session').client(process.env.SESSION_TABLE_NAME || 'arc-sessions')
var validate = require('./_validate')
var status = require('./_status-codes')

module.exports = function response(type, request, callback, cmds) {

  validate(type, cmds)

  session.write({
    request,
    cmds
  },
  function _sync(err, res) {
    if (err) throw err
    if (res.location) res.status = 302
    if (res.status) {
      callback(status(res))
    }
    else {
      callback(null, res)
    }
  })
}
