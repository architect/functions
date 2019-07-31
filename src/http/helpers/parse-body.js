let qs = require('querystring')

module.exports = function parseBody (req) {
  if (!req.body || !Object.getOwnPropertyNames(req.body).length) return req.body
  else {
    // Is it a string?
    let string = Object.getOwnPropertyNames(req.body).findIndex(i => i === 'length') !== -1
    // Is it base64 encoded?
    let isBase64 = req.isBase64Encoded

    let contentType = type => req.headers && req.headers['Content-Type'].includes(type)

    if (!string) {
      null // noop on pre-parsed non-string objects (<Arc 6)
    }

    else if (contentType('application/json') && isBase64) {
      try {
        // Handles base64 + JSON-encoded payloads (>Arc 6)
        let data = new Buffer.from(req.body, 'base64').toString()
        req.body = JSON.parse(data) || {}
      }
      catch(e) {
        throw Error('Invalid request body encoding or invalid JSON')
      }
    }

    else if (contentType('application/x-www-form-urlencoded') && isBase64) {
      let data = new Buffer.from(req.body, 'base64').toString()
      req.body = qs.parse(data)
    }

    else if (contentType('multipart/form-data') || contentType('application/octet-stream') && isBase64) {
      req.body = {base64: req.body}
    }

    else if (contentType('multipart/form-data') && isBase64) {
      req.body = {base64: req.body}
    }

    // TODO maybe?
    // - text/plain
    // - application/xml

    return req.body
  }
}