let getPorts = require('./_get-ports')
let sandboxVersionAtLeast = require('./_sandbox-version')

let isNode18 = Number(process.version.replace('v', '').split('.')[0]) >= 18

let nonLocalEnvs = [ 'staging', 'production' ]
function useAWS () {
  let { ARC_ENV, ARC_LOCAL } = process.env
  if (ARC_ENV === 'testing') return false
  if (nonLocalEnvs.includes(ARC_ENV) && ARC_LOCAL) return true
  return false
}

module.exports = {
  getPorts,
  isNode18,
  sandboxVersionAtLeast,
  useAWS,
}
