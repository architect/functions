let { ApiGatewayManagementApi } = require('aws-sdk')

let _api
function instantiateAPI () {
  if (_api) return
  let { ARC_ENV: env, ARC_INTERNAL_PORT: port, ARC_LOCAL, ARC_WSS_URL } = process.env
  let local = env === 'testing' || ARC_LOCAL
  if (local) {
    if (!port) throw ReferenceError('ARC_INTERNAL_PORT env var not found')
    _api = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: `http://localhost:${port}/_arc/ws`,
      region: process.env.AWS_REGION || 'us-west-2',
    })
  }
  else {
    _api = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: `${ARC_WSS_URL.replace(/^ws/, 'http')}`,
    })
  }
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
  instantiateAPI()
  let params = {
    ConnectionId: id,
    Data: JSON.stringify(payload)
  }

  if (callback) {
    _api.postToConnection(params, callback)
    return
  }
  return _api.postToConnection(params).promise()
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
  instantiateAPI()
  let params = { ConnectionId: id }
  if (callback) {
    _api.deleteConnection(params, callback)
    return
  }
  return _api.deleteConnection(params).promise()
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
  instantiateAPI()
  let params = { ConnectionId: id }
  if (callback) {
    _api.getConnection(params, callback)
    return
  }
  return _api.getConnection(params).promise()
}

module.exports = {
  _api,
  send,
  close,
  info,
}
