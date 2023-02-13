let getPorts = require('./_get-ports')
let sandboxVersionAtLeast = require('./_sandbox-version')

let isNode18 = Number(process.version.replace('v', '').split('.')[0]) >= 18

let nonLocalEnvs = [ 'staging', 'production' ]
function useAWS () {
  let { ARC_ENV, ARC_LOCAL, ARC_SANDBOX } = process.env
  // Testing is always local
  if (ARC_ENV === 'testing') return false
  // Local, but using AWS resources
  if (nonLocalEnvs.includes(ARC_ENV) && ARC_SANDBOX && !ARC_LOCAL) return false
  // Assumed to be AWS
  return true
}

module.exports = {
  getPorts,
  isNode18,
  sandboxVersionAtLeast,
  useAWS,
}
