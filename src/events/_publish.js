var assert = require('@smallwins/assert')
var aws = require('aws-sdk')
var sns = new aws.SNS
var arn = false // cache the arn

// priv publish
// blindly publishes to sns topic json stringified record
// throws if fails so lambda errors are noticible
function __publish(arn, payload, callback) {
  sns.publish({
    TopicArn: arn,
    Message: JSON.stringify(payload)
  },
  function _published(err, result) {
    if (err) throw err
    callback(null, result)
  })
}

module.exports = function _publish(params, callback) {
  assert(params, {
    name: String,
    payload: Object
  })
  var {name, payload} = params
  if (arn) {
    __publish(arn, payload, callback)
  }
  else {
    var eventName = `${process.env.ARC_APP_NAME}-${process.env.NODE_ENV}-${name}`
    // lookup the event sns topic arn
    sns.listTopics({}, function _listTopics(err, results) {
      if (err) throw err
      var found = results.Topics.find(t=> {
        var bits =  t.TopicArn.split(':')
        var it = bits[bits.length - 1]
        return it === eventName
      })
      if (found) {
        // cache the arn here
        arn = found.TopicArn
        // and continue
        __publish(arn, payload, callback)
      }
      else {
        throw Error(`topic ${eventName} not found`) // fail loudly if we can't find it
      }
    })
  }
}
