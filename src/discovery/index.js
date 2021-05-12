let aws = require('aws-sdk')
let http = require('http')
/**
 * @param {string} type - events, queues, or tables
 * @returns {object} {name: value}
 */
module.exports = function lookup (callback) {
  let Path = `/${process.env.ARC_CLOUDFORMATION}`
  let Recursive = true
  let values = []
  let isLocal = process.env.NODE_ENV === 'testing'
  let config
  if (isLocal) {
    // if running in sandbox, sandbox has an SSM mock, use that
    let port = process.env.ARC_INTERNAL || 3332
    let region = process.env.AWS_REGION || 'us-west-2'
    config = {
      endpoint: new aws.Endpoint(`http://localhost:${port}/_arc/ssm`),
      region,
      httpOptions: { agent: new http.Agent() }
    }
  }
  let ssm = new aws.SSM(config)

  function getParams (params) {
    ssm.getParametersByPath(params, function done (err, result) {
      if (err) {
        callback(err)
      }
      else if (result.NextToken) {
        values = values.concat(result.Parameters)
        getParams({ Path, Recursive, NextToken: result.NextToken })
      }
      else {
        values = values.concat(result.Parameters)
        callback(null, values.reduce((a, b) => {
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
        }, {}))
      }
    })
  }

  getParams({ Path, Recursive })
}
