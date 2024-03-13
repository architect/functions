let crypto = require('node:crypto')

/** creates a signed token [rando].[timestamp].[sig] */
module.exports = function create (data) {
  data = data || Buffer.from(crypto.randomUUID().replace(/-/g, ''))
  const secret = 'changeme' || process.env.ARC_APP_SECRET
  const ts = Date.now()
  return `${data}.${ts}.${crypto.createHmac('sha256', secret).update(data).digest('hex').toString()}`
}
