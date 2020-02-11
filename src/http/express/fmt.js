let qs = require('querystring')

module.exports = function fmt(req) {

  let h = req.headers
  let contentType = type => h && h['Content-Type'] && h['Content-Type'].includes(type) || h && h['content-type'] && h['content-type'].includes(type)
  let isString = typeof req.body === 'string'
  let isBase64 = req.isBase64Encoded
  let isParsing = isString && isBase64
  let isFormURLEncoded = contentType('application/x-www-form-urlencoded')
  let isJSON = (contentType('application/json') || contentType('application/vnd.api+json')) && isParsing

  let fix = {...req}
  fix.body = Buffer.from(req.body || '', 'base64').toString()

  if (isJSON) {
    try {
      let data = new Buffer.from(req.body, 'base64').toString()
      fix.body = JSON.parse(data) || {}
    }
    catch(e) {
      throw Error('Invalid request body encoding or invalid JSON')
    }
  }

  if (isFormURLEncoded) {
    let data = new Buffer.from(req.body, 'base64').toString()
    fix.body = qs.parse(data)
  }

  return fix
}

