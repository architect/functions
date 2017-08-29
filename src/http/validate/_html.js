var checkForHtmlErrors = require('./_html-errors')

module.exports = function _html(cmds) {

  if (!(cmds instanceof Error)) {
    cmds = checkForHtmlErrors(cmds)
  }
  /**
   * adds support for res(Error('wtf')) 
   * if `error.code` is present use that for the status code 
   * falls back to 500 error otherwise
   */
  if (cmds instanceof Error) {
    var commands = {
      status: cmds.code || cmds.statusCode || 500,
      html: `<h1>${cmds.toString()}</h1><pre>${cmds.stack}</pre>`
    }
    cmds = commands
  }

  // return the formatted cmds
  return cmds
}
