var checkForHtmlErrors = require('./_html-errors')

module.exports = function _html(cmds) {
  if (cmds instanceof Error) throw cmds
  checkForHtmlErrors(cmds)
  return cmds
}
