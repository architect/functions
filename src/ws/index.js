let { ApiGatewayManagementApi } = require('aws-sdk')
let legacySendSandbox = require('./legacy-send-sandbox')
let legacySendAWS = require('./legacy-send')

let ARC_WSS_URL = process.env.ARC_WSS_URL
let port = process.env.ARC_INTERNAL || '3332'

let apiGatewayManagementApi
if (process.env.NODE_ENV === 'testing') {
  apiGatewayManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `http://localhost:${port}/_arc/ws`,
    region: process.env.AWS_REGION || 'us-west-2',
  })
}
else {
  apiGatewayManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `${ARC_WSS_URL.replace(/^ws/, 'http')}`,
  })
}

/**
 * arc.ws.send
 *
 * publish web socket events
 *
 * @param {Object} params
 * @param {String} params.id - the ws connection id (required)
 * @param {Object} params.payload - an event payload (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function send ({ id, payload }, callback) {
  let params = {
    ConnectionId: id,
    Data: JSON.stringify(payload)
  }

  if (callback) {
    apiGatewayManagementApi.postToConnection(params, callback)
    return
  }
  return apiGatewayManagementApi.postToConnection(params).promise()
}

/**
 * arc.ws.close
 *
 * publish web socket events
 *
 * @param {Object} params
 * @param {String} params.id - the ws connection id (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function close ({ id }, callback) {
  let params = { ConnectionId: id }
  if (callback) {
    apiGatewayManagementApi.deleteConnection(params, callback)
    return
  }
  return apiGatewayManagementApi.deleteConnection(params).promise()
}

/**
 * arc.ws.info
 *
 * publish web socket events
 *
 * @param {Object} params
 * @param {String} params.id - the ws connection id (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function info ({ id }, callback) {
  let params = { ConnectionId: id }
  if (callback) {
    apiGatewayManagementApi.getConnection(params, callback)
    return
  }
  return apiGatewayManagementApi.getConnection(params).promise()
}

/**
 * arc.ws.send
@@ -9,28 +26,44 @@ let run = require('./send')
 * @param {Object} params
 * @param {String} params.id - the ws connection id (required)
 * @param {Object} params.payload - an event payload (required)
 * @param {Function} callback - a node style errback (optional)
 * @returns {Promise} - returned if no callback is supplied
 */
function legacySend ({ id, payload }, callback) {
  // create a promise if no callback is defined
  let promise
  if (!callback) {
    promise = new Promise(function (res, rej) {
      callback = function (err, result) {
        err ? rej(err) : res(result)
      }
    })
  }

  let local = process.env.NODE_ENV === 'testing' || process.env.ARC_LOCAL
  let exec = local ? legacySendSandbox : legacySendAWS

  exec({
    id,
    payload
  }, callback)

  return promise
}

module.exports = {
  apiGatewayManagementApi,
  send: legacySend,
  newSend: send,
  close,
  info,
}
