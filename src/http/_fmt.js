// used by _response to format the payload for api gateway
module.exports = function fmt(cmds) {
  var payload = {
    statusCode: cmds.status
  }
  if (cmds.html) {
    payload.html = cmds.html // {html, statusCode}
  }
  if (cmds.css) {
    payload.css = cmds.css // {css, statusCode}
  }
  if (cmds.js) {
    payload.js = cmds.js // {js, statusCode}
  }
  if (cmds.json) {
    payload.json = cmds.json // {json, statusCode}
  }
  return JSON.stringify(payload)
}
