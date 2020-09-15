let http = require('http')

module.exports = function publishLocal (params, callback) {
  let port = process.env.ARC_EVENTS_PORT || 3334
  let req = http.request({
    method: 'POST',
    port,
    path: '/events',
  },
  function done (res) {
    res.resume()
    res.on('end', () => callback())
  })
  req.write(JSON.stringify(params))
  req.end('\n')
}
