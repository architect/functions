var checkForHtmlErrors = require('./_html-errors')

var css = `
body {
  font-family: sans-serif;
  color: #999;
}

h1 {
  width: 850px;
  color: black;
  font-size: 2.1em;
  margin: 5% auto 20px auto;
}

pre {
  width: 850px;
  margin: 0 auto 0 auto;
}

`
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
      html: `<html><head><style>${css}</style></head><body><h1>${cmds.toString()}</h1><pre>${cmds.stack}</pre></body></html>`
    }
    cmds = commands
  }

  // return the formatted cmds
  return cmds
}
