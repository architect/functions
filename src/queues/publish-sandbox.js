let http = require('http')

module.exports = function sandbox (params, callback) {
  let port = process.env.ARC_EVENTS_PORT || 3334
  let req = http.request({
    method: 'POST',
    port,
    path: '/queues',
  })
  req.write(JSON.stringify(params))
  req.end()
  callback()
}
