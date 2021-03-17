let aws = require('aws-sdk')
let ledger = {}

module.exports = function liveFactory (arc) {
  return function live ({ name, payload }, callback) {

    function publish (arn, payload, callback) {
      console.log('sns.publish', JSON.stringify({ arn, payload }))
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
    else if (!arc.services) {
      // lazy load service map if not fetched yet
      console.log('lazy loading events')
      arc._loadServices().then(cacheLedgerAndPublish).catch(callback)
    }
    else {
      // services were loaded before, set up queue ledger / cache 
      cacheLedgerAndPublish(arc.services)
    }
  }
}
