let aws = require('aws-sdk')

module.exports = function send({id, payload}, callback) {
  let api = new aws.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `https://${process.env.ARC_WSS_URL}/${process.env.NODE_ENV}`
  })
  api.postToConnection({
    ConnectionId: id,
    Data: JSON.stringify(payload)
  },
  function postToConnection(err) {
    if (err) callback(err)
    else callback()
  })
}
