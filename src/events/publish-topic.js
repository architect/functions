let aws = require('aws-sdk')
let lookup = require('../discovery')
let ledger = {}

module.exports = function live ({ name, payload }, callback) {

  function publish (arn, payload, callback) {
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
    lookup.events(function done (err, found) {
      if (err) callback(err)
      else if (!found[name]) {
        callback(ReferenceError(`${name} not found`))
      }
      else {
        ledger = found
        publish(ledger[name], payload, callback)
      }
    })
  }
}
