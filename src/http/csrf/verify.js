let create = require('./create')

/** ensures payload is valid token that hasn't expired */
module.exports = function verify (payload) {
  const [ data, ts, sig ] = payload.split('.')
  if (Date.now() > ts) return false
  const gen = create(data, ts)
  const sig2 = gen.split('.').pop()
  return sig2 === sig
}
