let checkForHtmlErrors = require('./_html-errors')
let checkForJsonErrors = require('./_json-errors')
let checkForXmlErrors = require('./_xml-errors')
let checkForCssErrors = require('./_css-errors')
let checkForJsErrors = require('./_js-errors')
let checkForTextErrors = require('./_text-errors')

module.exports = function validate(type, cmds) {

  if (cmds instanceof Error) throw cmds

  if (type === 'text/html') {
    checkForHtmlErrors(cmds)
  }

  if (type === 'application/json') {
    checkForJsonErrors(cmds)
  }

  if (type === 'application/xml') {
    checkForXmlErrors(cmds)
  }

  if (type === 'text/css') {
    checkForCssErrors(cmds)
  }

  if (type === 'text/javascript') {
    checkForJsErrors(cmds)
  }

  if (type === 'text/plain') {
    checkForTextErrors(cmds)
  }

  return cmds
}
