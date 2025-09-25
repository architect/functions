const crypto = require('node:crypto')
const fiveMinutes = 300000

/** creates a signed token [rando].[timestamp].[sig] */
module.exports = function create(data, ts) {
  data = data || Buffer.from(crypto.randomUUID().replace(/-/g, ''))
  ts = ts || Date.now() + fiveMinutes
  const secret = process.env.ARC_APP_SECRET || process.env.ARC_APP_NAME || 'fallback'
  return `${data}.${ts}.${crypto.createHmac('sha256', secret).update(data).digest('hex').toString()}`
}
