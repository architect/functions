const { ApiGatewayManagementApi, PostToConnectionCommand, DeleteConnectionCommand, GetConnectionCommand
} = require('@aws-sdk/client-apigatewaymanagementapi')

let _api

function instantiateAPI () {
  if (_api) return
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
  const command = new PostToConnectionCommand({
    ConnectionId: id,
    Data: JSON.stringify(payload)
  })
  if (callback) {
    _api.send(command, callback)
    return
  }
  return _api.send(command)
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
  const command = new DeleteConnectionCommand({
    ConnectionId: id,
  })
  if (callback) {
    _api.send(command, callback)
    return
  }
  return _api.send(command)
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
  const command = new GetConnectionCommand({
    ConnectionId: id,
  })
  if (callback) {
    _api.send(command, callback)
    return
  }
  return _api.send(command)
}

module.exports = {
  send,
  close,
  info,
}

Object.defineProperty(module.exports, '_api', {
  enumerable: true,
  get () {
    instantiateAPI()
    return _api
  }
})
