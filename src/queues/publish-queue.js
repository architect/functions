let aws = require('aws-sdk')
let ledger = {}

module.exports = function liveFactory (services) {
  return function live ({ name, payload, delaySeconds, groupID }, callback) {

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
      services.then(function (serviceMap) {
        if (!serviceMap.queues[name]) callback(ReferenceError(`${name} queue not found`))
        else {
          ledger = serviceMap.queues
          publish(ledger[name], payload, callback)
        }
      }).catch(callback)
    }
  }
}
