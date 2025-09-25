const getPorts = require('./_get-ports')
const sandboxVersionAtLeast = require('./_sandbox-version')

const isNode18 = Number(process.version.replace('v', '').split('.')[0]) >= 18

const nonLocalEnvs = ['staging', 'production']

function getAwsClient(params, callback) {
  const awsLite = require('@aws-lite/client')
  params.region = process.env.AWS_REGION || 'us-west-2'
  awsLite(params)
    .then((client) => callback(null, client))
    .catch((err) => {
      if (err.message.includes('AWS credentials') && !useAWS()) {
        const accessKeyId = 'arcDummyAccessKey'
        const secretAccessKey = 'arcDummySecretKey'
        awsLite({ ...params, accessKeyId, secretAccessKey })
          .then((client) => callback(null, client))
          .catch(callback)
      } else callback(err)
    })
}

function useAWS() {
  const { ARC_ENV, ARC_LOCAL, ARC_SANDBOX } = process.env
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
