let aws = require('aws-sdk')
/**
 * @param {string} type - events, queues, or tables
 * @returns {object} {name: value}
 */
module.exports = function lookup (callback) {
  if (process.env.NODE_ENV === 'testing') lookupSandbox(callback)
  else lookupSSM(callback)
}

function lookupSandbox (callback) {
  let port = process.env.PORT || 3333
  let req = http.request({
    method: 'GET',
    port,
    path: '/_asd',
  },
  function done (res) {
    let data = []
    res.resume()
    res.on('data', chunk => data.push(chunk))
    res.on('end', () => {
      let body = Buffer.concat(data).toString()
      let code = `${res.statusCode}`
      if (!code.startsWith(2)) callback(Error(`_asd error; (${code}) ${body}`))
      else callback(null, JSON.parse(body))
    })
  })
  req.write(JSON.stringify(params))
  req.end('\n')
}

function lookupSSM (callback) {
  let st = new Date().valueOf()
  let Path = `/${process.env.ARC_CLOUDFORMATION}`
  let Recursive = true
  let values = []

  function getParams (params) {
    let ssm = new aws.SSM
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
          while (child = hierarchy.shift()) {
            parent[child] = {}
            lastParent = parent
            parent = parent[child]
            lastChild = child
          }
          lastParent[lastChild] = b.Value
          return a
        }, {}))
        console.log('discovery took', (new Date().valueOf() - st), 'ms')
      }
    })
  }

  getParams({ Path, Recursive })
}
