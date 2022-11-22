const isNode18 = require('../_node-version')

let _api, _send, _close, _info

function instantiateAPI () {
  if (_api) return

  let {
    ARC_ENV,
    ARC_LOCAL,
    ARC_WSS_URL,
    AWS_REGION,
    ARC_SANDBOX,
  } = process.env

  if (isNode18) {
    var {
      ApiGatewayManagementApi,
      PostToConnectionCommand,
      DeleteConnectionCommand,
      GetConnectionCommand
    } = require('@aws-sdk/client-apigatewaymanagementapi')
  }
  else {
    var ApiGatewayManagementApi = require('aws-sdk/clients/apigatewaymanagementapi')
  }

  let local = ARC_ENV === 'testing' || ARC_LOCAL
  if (local) {
    let { ports } = JSON.parse(ARC_SANDBOX)
    let port = ports._arc
    if (!port)
      throw ReferenceError('Architect internal port not found')
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

  /** idk.. **/
  _send = (params, callback) => {
    if (isNode18) {
      let cmd = new PostToConnectionCommand(params)
      return _api.send(cmd, callback)
    }
    else {
      return callback ? _api.postToConnection(params, callback) : _api.postToConnection(params).promise()
    }
  }

  /** idk.. **/
  _close = (params, callback) => {
    if (isNode18) {
      let cmd = new DeleteConnectionCommand(params)
      return _api.send(cmd, callback)
    }
    else {
      return callback ? _api.deleteConnection(params, callback) : _api.deleteConnection(params).promise()
    }
  }

  /** idk.. **/
  _info = (params, callback) => {
    if (isNode18) {
      let cmd = new GetConnectionCommand(params)
      return _api.send(cmd, callback)
    }
    else {
      return callback ? _api.getConnection(params, callback) : _api.getConnection(params).promise()
    }
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
  return _send({
    ConnectionId: id,
    Data: JSON.stringify(payload)
  }, callback)
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
  return _close({
    ConnectionId: id,
  }, callback)
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
  return _info({
    ConnectionId: id,
  }, callback)
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
