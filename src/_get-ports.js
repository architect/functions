let discovery = require('./discovery')

module.exports = function getPorts (callback) {
  let { ARC_SANDBOX } = process.env
  let notFound = ReferenceError('Sandbox internal port not found')
  // Sandbox env var is the happy path for Lambda runs
  if (ARC_SANDBOX) {
    let { ports } = JSON.parse(ARC_SANDBOX)
    if (!ports) {
      return callback(notFound)
    }
    callback(null, ports)
  }
  // Fall back to an internal SSM query in case Functions is running as a bare module
  else {
    discovery((err, services) => {
      if (err) callback(err)
      else {
        if (!services.ARC_SANDBOX || !services.ARC_SANDBOX.ports) {
          return callback(notFound)
        }
        let ports = JSON.parse(services.ARC_SANDBOX.ports)
        callback(null, ports)
      }
    })
  }
}
