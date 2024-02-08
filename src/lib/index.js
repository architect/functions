let getPorts = require('./_get-ports')
let sandboxVersionAtLeast = require('./_sandbox-version')

let isNode18 = Number(process.version.replace('v', '').split('.')[0]) >= 18

let nonLocalEnvs = [ 'staging', 'production' ]

function getAwsClient (params, callback) {
  let awsLite = require('@aws-lite/client')
  params.region = process.env.AWS_REGION || 'us-west-2'
  awsLite(params)
    .then(client => callback(null, client))
    .catch(err => {
      if (err.message.includes('AWS credentials') && !useAWS()) {
        let accessKeyId = 'arc_dummy_access_key'
        let secretAccessKey = 'arc_dummy_secret_key'
        awsLite({ ...params, accessKeyId, secretAccessKey })
          .then(client => callback(null, client))
          .catch(callback)
      }
      else callback(err)
    })
}

function useAWS () {
  let { ARC_ENV, ARC_LOCAL, ARC_SANDBOX } = process.env
  // Testing is always local
  if (ARC_ENV === 'testing') return false
  // Local, but using !testing environments
  if (nonLocalEnvs.includes(ARC_ENV) && ARC_SANDBOX && !ARC_LOCAL) return false
  // Assumed to be AWS
  return true
}

module.exports = {
  getAwsClient,
  getPorts,
  isNode18,
  sandboxVersionAtLeast,
  useAWS,
}
