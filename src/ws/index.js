const { getAwsClient, useAWS } = require('../lib')
let client
let ApiUrl

function instantiateAPI() {
  return new Promise((res, rej) => {
    if (client) res(client)

    getAwsClient(
      {
        plugins: [import('@aws-lite/apigatewaymanagementapi')],
      },
      (err, _client) => {
        if (err) rej(err)
        else {
          client = _client
          const { ARC_WSS_URL, ARC_SANDBOX } = process.env

          if (useAWS()) {
            ApiUrl = ARC_WSS_URL
          } else {
            const { ports } = JSON.parse(ARC_SANDBOX)
            const port = ports._arc
            if (!port) throw ReferenceError('Architect internal port not found')
            ApiUrl = `http://localhost:${port}/_arc/ws`
          }
          res(client)
        }
      },
    )
  })
}

function _api(callback) {
  if (callback)
    instantiateAPI()
      .then((client) => callback(null, client.ApiGatewayManagementApi))
      .catch(callback)
  else
    return new Promise((res, rej) => {
      instantiateAPI()
        .then((client) => res(client.ApiGatewayManagementApi))
        .catch(rej)
    })
}

function send({ id, payload }, callback) {
  if (callback)
    instantiateAPI()
      .then((client) => {
        client.ApiGatewayManagementApi.PostToConnection({
          ApiUrl,
          ConnectionId: id,
          Data: payload,
        })
          .then((result) => callback(null, result))
          .catch(callback)
      })
      .catch(callback)
  else
    return new Promise((res, rej) => {
      instantiateAPI()
        .then((client) => {
          client.ApiGatewayManagementApi.PostToConnection({
            ApiUrl,
            ConnectionId: id,
            Data: payload,
          })
            .then((result) => res(result))
            .catch(rej)
        })
        .catch(rej)
    })
}

function close({ id }, callback) {
  if (callback)
    instantiateAPI()
      .then((client) => {
        client.ApiGatewayManagementApi.DeleteConnection({
          ApiUrl,
          ConnectionId: id,
        })
          .then((result) => callback(null, result))
          .catch(callback)
      })
      .catch(callback)
  else
    return new Promise((res, rej) => {
      instantiateAPI()
        .then((client) => {
          client.ApiGatewayManagementApi.DeleteConnection({
            ApiUrl,
            ConnectionId: id,
          })
            .then((result) => res(result))
            .catch(rej)
        })
        .catch(rej)
    })
}

function info({ id }, callback) {
  if (callback)
    instantiateAPI()
      .then((client) => {
        client.ApiGatewayManagementApi.GetConnection({
          ApiUrl,
          ConnectionId: id,
        })
          .then((result) => callback(null, result))
          .catch(callback)
      })
      .catch(callback)
  else
    return new Promise((res, rej) => {
      instantiateAPI()
        .then((client) => {
          client.ApiGatewayManagementApi.GetConnection({
            ApiUrl,
            ConnectionId: id,
          })
            .then((result) => res(result))
            .catch(rej)
        })
        .catch(rej)
    })
}

module.exports = {
  _api,
  send,
  close,
  info,
}
