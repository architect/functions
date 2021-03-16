let aws = require('aws-sdk')
let ledger = {}

module.exports = function liveFactory (services) {
  return function live ({ name, payload }, callback) {

    function publish (arn, payload, callback) {
      console.log('sns.publish', JSON.stringify({ arn, payload }))
      let sns = new aws.SNS
      sns.publish({
        TopicArn: arn,
        Message: JSON.stringify(payload)
      }, callback)
    }

    let arn = ledger[name]
    if (arn) {
      publish(ledger[name], payload, callback)
    }
    else {
      services.then(function (serviceMap) {
        if (!serviceMap.events[name]) callback(ReferenceError(`${name} event not found`))
        else {
          ledger = serviceMap.events
          publish(ledger[name], payload, callback)
        }
      }).catch(callback)
    }
  }
}
