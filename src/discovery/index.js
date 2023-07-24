let { isNode18, useAWS } = require('../lib')
let ssm, ssmClient

/**
 * @param {string} type - events, queues, or tables
 * @returns {object} {name: value}
 */
module.exports = function lookup (callback) {

  let { ARC_APP_NAME: app, ARC_ENV: env, ARC_SANDBOX, ARC_STACK_NAME: stack, AWS_REGION } = process.env

  let local = !useAWS()

  if (!local && !app && !stack) {
    return callback(ReferenceError('ARC_APP_NAME and ARC_STACK_NAME env vars not found'))
  }

  if (local && !app) {
    app = 'arc-app'
  }

  let Path = `/${stack || toLogicalID(`${app}-${env}`)}`
  let Recursive = true
  let values = []
  let config

  if (local) {
    let port = 2222
    if (ARC_SANDBOX) {
      let { ports } = JSON.parse(ARC_SANDBOX)
      if (!ports._arc) {
        return callback(ReferenceError('Sandbox internal port not found'))
      }
      port = ports._arc
    }
    config = {
      endpoint: `http://localhost:${port}/_arc/ssm`,
      region: AWS_REGION || 'us-west-2',
    }
  }

  // shim v2 and v3
  if (!ssmClient) {
    if (isNode18) {
      let { SSMClient: SSM, GetParametersByPathCommand: cmd } = require('@aws-sdk/client-ssm')
      let GetParametersByPathCommand = cmd
      ssm = new SSM(config)
      ssmClient = (params, callback) => {
        let command = new GetParametersByPathCommand(params)
        return ssm.send(command, callback)
      }
    }
    else {
      let SSM = require('aws-sdk/clients/ssm')
      ssm = new SSM(config)
      ssmClient = (params, callback) => {
        return ssm.getParametersByPath(params, callback)
      }
    }
  }

  function getParams (params) {
    ssmClient(params, function done (err, result) {
      if (err && local &&
          err.message.includes('Inaccessible host') &&
          err.message.includes('localhost')) {
        let msg = 'Sandbox internal services are unavailable, please ensure Sandbox is running'
        callback(ReferenceError(msg))
      }
      else if (err) {
        callback(err)
      }
      else if (result.NextToken) {
        values = values.concat(result.Parameters)
        getParams({ Path, Recursive, NextToken: result.NextToken })
      }
      else {
        values = values.concat(result.Parameters)
        let services = values.reduce((a, b) => {
          let hierarchy = b.Name.split('/')
          hierarchy.shift() // leading slash
          hierarchy.shift() // stack name
          let type = hierarchy.shift() // i.e. tables, events, queues, plugins
          if (!a[type]) a[type] = {}
          let parent = a[type]
          let child, lastChild, lastParent
          /* eslint-disable-next-line */
          while (child = hierarchy.shift()) {
            if (!parent[child]) parent[child] = {}
            lastParent = parent
            parent = parent[child]
            lastChild = child
          }
          lastParent[lastChild] = b.Value
          return a
        }, {})
        callback(null, services)
      }
    })
  }
  getParams({ Path, Recursive })
}

function toLogicalID (str) {
  str = str.replace(/([A-Z])/g, ' $1')
  if (str.length === 1) {
    return str.toUpperCase()
  }
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase()
  str = str.charAt(0).toUpperCase() + str.slice(1)
  str = str.replace(/[\W_]+(\w|$)/g, (_, ch) => ch.toUpperCase())
  if (str === 'Get') {
    return 'GetIndex'
  }
  return str
}
