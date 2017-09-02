var checkForJsonErrors = require('./_json-errors')
var serialize = require('serialize-error')

module.exports = function _json(cmds) {

  if (!(cmds instanceof Error)) {
    cmds = checkForJsonErrors(cmds)
  }
  /**
   * adds support for res(Error('wtf'))
   * if `error.code` is present use that for the status code
   * falls back to 500 error otherwise
   */
  if (cmds instanceof Error) {
    var commands = {
      status: cmds.code || cmds.statusCode || 500,
      json: JSON.stringify(cmds.toJSON? cmds.toJSON() : serialize(cmds))
    }
    cmds = commands
  }

  // return the formatted cmds
  return cmds
}
