var checkForHtmlErrors = require('./_html-errors')
var checkForJsonErrors = require('./_json-errors')

module.exports = function validate(type, cmds) {

  if (cmds instanceof Error) throw cmds

  if (type === 'text/html') {
    checkForHtmlErrors(cmds)
  }
  else {
    checkForJsonErrors(cmds)
  }

  return cmds
}
