let getPorts = require('./_get-ports')
let sandboxVersionAtLeast = require('./_sandbox-version')

let nonLocalEnvs = [ 'staging', 'production' ]
function useAWS () {
  let { ARC_ENV, ARC_LOCAL } = process.env
  if (ARC_ENV === 'testing') return false
  if (nonLocalEnvs.includes(ARC_ENV) && ARC_LOCAL) return true
  return false
}

let nodeVersion = Number(process.version.replace('v', '').split('.')[0]) >= 18

module.exports = {
  nodeVersion,
  getPorts,
  sandboxVersionAtLeast,
  useAWS,
}
