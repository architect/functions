let aws = require('aws-sdk')
let ledger = {}

module.exports = function liveFactory (arc) {
  return function live ({ name, payload }, callback) {

    function publish (arn, payload, callback) {
      let sns = new aws.SNS
      sns.publish({
        TopicArn: arn,
        Message: JSON.stringify(payload)
      }, callback)
    }

    function cacheLedgerAndPublish (serviceMap) {
      ledger = serviceMap.events
      if (!ledger[name]) callback(ReferenceError(`${name} event not found`))
      else publish(ledger[name], payload, callback)
    }

    let arn = ledger[name]
    if (arn) {
      publish(ledger[name], payload, callback)
    }
    else {
      arc.services().then(cacheLedgerAndPublish).catch(callback)
    }
  }
}
