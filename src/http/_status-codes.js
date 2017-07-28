// formats the payload for api gateway
module.exports = function status(cmds) {
  var statusCode = cmds.status
  var payload = {statusCode}
  if (cmds.html) {
    payload.html = cmds.html
  }
  if (cmds.css) {
    payload.css = cmds.css
  }
  if (cmds.js) {
    payload.js = cmds.js
  }
  if (cmds.json) {
    payload.json = cmds.json
  }
  return JSON.stringify(payload)
}
