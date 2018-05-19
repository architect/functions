// used by _response to format the payload for api gateway
module.exports = function fmt(cmds) {
  let payload = {...cmds}
  payload.statusCode = cmds.status
  return JSON.stringify(payload)
}
