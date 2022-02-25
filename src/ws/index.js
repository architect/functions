let _api
function instantiateAPI () {
  if (_api) return
  // We really only want to load aws-sdk if absolutely necessary
  // eslint-disable-next-line
  let ApiGatewayManagementApi = require('aws-sdk/clients/apigatewaymanagementapi')
  let {
    ARC_ENV,
    ARC_LOCAL,
    ARC_WSS_URL,
    AWS_REGION,
    ARC_SANDBOX,
  } = process.env
  let local = ARC_ENV === 'testing' || ARC_LOCAL
  if (local) {
    let { ports } = JSON.parse(ARC_SANDBOX)
    let port = ports._arc
    if (!port) throw ReferenceError('Architect internal port not found')
    _api = new ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: `http://localhost:${port}/_arc/ws`,
      region: AWS_REGION || 'us-west-2',
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
