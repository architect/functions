let create = require('./create')

/** ensures payload is valid token that hasn't expired */
module.exports = function verify (payload) {
  const [ data, ts, sig ] = payload.split('.')
  const elapsed = Date.now() - ts
  const fiveMinutes = 300000
  if (elapsed > fiveMinutes) return false
  const gen = create(data)
  const sig2 = gen.split('.').pop()
  return sig2 === sig
}
