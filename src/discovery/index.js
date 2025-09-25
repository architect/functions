const { getAwsClient, useAWS } = require('../lib')

/**
 * @param {string} type - events, queues, or tables
 * @returns {object} {name: value}
 */
module.exports = function lookup(callback) {
  let { ARC_APP_NAME: app, ARC_ENV: env, ARC_SANDBOX, ARC_STACK_NAME: stack } = process.env

  const local = !useAWS()

  if (!local && !app && !stack) {
    return callback(ReferenceError('ARC_APP_NAME and ARC_STACK_NAME env vars not found'))
  }

  if (local && !app) {
    app = 'arc-app'
  }

  const plugins = [import('@aws-lite/ssm')]
  const config = { plugins }
  if (local) {
    let port = 2222
    if (ARC_SANDBOX) {
      const { ports } = JSON.parse(ARC_SANDBOX)
      if (!ports._arc) {
        return callback(ReferenceError('Sandbox internal port not found'))
      }
      port = ports._arc
    }
    config.endpoint = `http://localhost:${port}/_arc/ssm`
  }

  getAwsClient(config, (err, client) => {
    if (err) callback(err)
    else {
      const Path = `/${stack || toLogicalID(`${app}-${env}`)}`
      client.ssm
        .GetParametersByPath({ Path, Recursive: true, paginate: true })
        .then((result) => {
          const services = result.Parameters.reduce((a, b) => {
            const hierarchy = b.Name.split('/')
            hierarchy.shift() // leading slash
            hierarchy.shift() // stack name
            const type = hierarchy.shift() // i.e. tables, events, queues, plugins
            if (!a[type]) a[type] = {}
            let parent = a[type]
            let child
            let lastChild
            let lastParent
            // biome-ignore lint/suspicious/noAssignInExpressions: we know what we are doing here
            while ((child = hierarchy.shift())) {
              if (!parent[child]) parent[child] = {}
              lastParent = parent
              parent = parent[child]
              lastChild = child
            }
            lastParent[lastChild] = b.Value
            return a
          }, {})
          callback(null, services)
        })
        .catch((err) => {
          if (err && local && err.message.includes('Inaccessible host') && err.message.includes('localhost')) {
            const msg = 'Sandbox internal services are unavailable, please ensure Sandbox is running'
            callback(ReferenceError(msg))
          } else {
            callback(err)
          }
        })
    }
  })
}

function toLogicalID(str) {
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
