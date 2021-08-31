let http = require('http')

module.exports = function send ({ id, payload }, callback) {
  let port = process.env.PORT || 3333
  let body = JSON.stringify({ id, payload })
  let req = http.request({
    method: 'POST',
    port,
    path: '/__arc',
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body)
    }
  })
  req.on('error', callback)
  req.on('close', () => callback())
  req.write(body)
  req.end()
}
