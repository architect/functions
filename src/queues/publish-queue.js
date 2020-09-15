let aws = require('aws-sdk')
let lookup = require('../discovery')
let ledger = {}

module.exports = function live ({ name, payload, delaySeconds, groupID }, callback) {

  function publish (QueueUrl, payload, callback) {
    let sqs = new aws.SQS
    let params = {
      QueueUrl,
      DelaySeconds: delaySeconds || 0,
      MessageBody: JSON.stringify(payload)
    }
    if (QueueUrl.endsWith('.fifo')) {
      params.MessageGroupId = groupID || name
    }
    sqs.sendMessage(params, callback)
  }

  let arn = ledger[name]
  if (arn) {
    publish(ledger[name], payload, callback)
  }
  else {
    lookup.queues(function done (err, found) {
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
