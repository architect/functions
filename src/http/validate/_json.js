var checkForJsonErrors = require('./_json-errors')

module.exports = function _json(cmds) {
  if (cmds instanceof Error) throw cmds
  checkForJsonErrors(cmds)
  return cmds
}
