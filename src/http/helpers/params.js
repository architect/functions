let unUndefined = [ 'body', 'pathParameters', 'queryStringParameters' ]
let unNulled = [ 'body', 'pathParameters', 'queryStringParameters', 'multiValueQueryStringParameters' ]
let pathParams = /\{\w+\}/g

module.exports = function interpolateParams (req) {
  // Handle HTTP API v2.0 payload scenarios, which omit params instead of passing them as null
  if (req.version && req.version === '2.0') {
    let { requestContext: context } = req
    if (context && context.http && context.http.method) {
      req.httpMethod = context.http.method
    }
    unUndefined.forEach(i => {
      if (req[i] === undefined) req[i] = {}
    })
    // Expect 'GET /foo' or '$default'
    req.resource = req.routeKey.split(' ')[1] || req.routeKey
    // Backfill `req.path`
    req.path = req.rawPath
  }

  // Un-null APIG-proxy-Lambda params in 6+
  unNulled.forEach(i => {
    if (req[i] === null) req[i] = {}
  })

  // Convenient params commonplace in other web servers
  if (!req.method) req.method = req.httpMethod
  if (!req.params) req.params = req.pathParameters
  if (!req.query)  req.query  = req.queryStringParameters

  // Convenient path parameter interpolation; 6+ REST gets this for free in `req.path`
  if (pathParams.test(req.path)) {
    let matches = req.path.match(pathParams)
    let vars = matches.map(a => a.replace(/\{|\}/g, ''))
    let idx = 0
    matches.forEach(m => {
      req.path = req.path.replace(m, req.params[vars[idx]])
      idx += 1
    })
  }
  return req
}
