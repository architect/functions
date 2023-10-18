let { getAwsClient, useAWS } = require('../lib')
let client, ApiUrl

function instantiateAPI () {
  return new Promise((res, rej) => {
    if (client) res(client)

    getAwsClient({
      plugins: [ '@aws-lite/apigatewaymanagementapi' ]
    }, (err, _client) => {
      if (err) rej(err)
      else {
        client = _client
        let { ARC_WSS_URL, ARC_SANDBOX } = process.env

        if (useAWS()) {
          ApiUrl = ARC_WSS_URL
        }
        else {
          let { ports } = JSON.parse(ARC_SANDBOX)
          let port = ports._arc
          if (!port) throw ReferenceError('Architect internal port not found')
          ApiUrl = `http://localhost:${port}/_arc/ws`
        }
        res(client)
      }
    })
  })
}

/**
 * arc.ws._api
 *
 * Get the raw WebSocket client
 *
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function _api (callback) {
  if (callback) instantiateAPI()
    .then(client => callback(null, client))
    .catch(callback)

  else return new Promise((res, rej) => {
    instantiateAPI()
      .then(client => res(client))
      .catch(rej)
  })
}

/**
 * arc.ws.send
 *
 * Publish WebSocket events
 *
 * @param {Object} params
 * @param {String} params.id - the ws connection id (required)
 * @param {Object} params.payload - an event payload (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function send ({ id, payload }, callback) {
  if (callback) instantiateAPI()
    .then(client => {
      client.ApiGatewayManagementApi.PostToConnection({
        ApiUrl,
        ConnectionId: id,
        Data: payload,
      })
        .then(result => callback(null, result))
        .catch(callback)
    })
    .catch(callback)

  else return new Promise((res, rej) => {
    instantiateAPI()
      .then(client => {
        client.ApiGatewayManagementApi.PostToConnection({
          ApiUrl,
          ConnectionId: id,
          Data: payload,
        })
          .then(result => res(result))
          .catch(rej)
      })
      .catch(rej)
  })
}

/**
 * arc.ws.close
 *
 * Terminate a WebSocket client connection
 *
 * @param {Object} params
 * @param {String} params.id - the ws connection id (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function close ({ id }, callback) {
  if (callback) instantiateAPI()
    .then(client => {
      client.ApiGatewayManagementApi.DeleteConnection({
        ApiUrl,
        ConnectionId: id,
      })
        .then(result => callback(null, result))
        .catch(callback)
    })
    .catch(callback)

  else return new Promise((res, rej) => {
    instantiateAPI()
      .then(client => {
        client.ApiGatewayManagementApi.DeleteConnection({
          ApiUrl,
          ConnectionId: id,
        })
          .then(result => res(result))
          .catch(rej)
      })
      .catch(rej)
  })
}

/**
 * arc.ws.info
 *
 * Get info on a WebSocket client connection
 *
 * @param {Object} params
 * @param {String} params.id - the ws connection id (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function info ({ id }, callback) {
  if (callback) instantiateAPI()
    .then(client => {
      client.ApiGatewayManagementApi.GetConnection({
        ApiUrl,
        ConnectionId: id,
      })
        .then(result => callback(null, result))
        .catch(callback)
    })
    .catch(callback)

  else return new Promise((res, rej) => {
    instantiateAPI()
      .then(client => {
        client.ApiGatewayManagementApi.GetConnection({
          ApiUrl,
          ConnectionId: id,
        })
          .then(result => res(result))
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
