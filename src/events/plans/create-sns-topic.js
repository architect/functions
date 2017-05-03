var aws = require('aws-sdk')
var sns = new aws.Sns

module.exports = function _createSnsTopic(params, callback) {
  sns.createTopic({
    Name: params.topic,
  },
  function _createTopic(err, data) {
    if (err) console.log(err, err.stack) // an error occurred
    else console.log(data)           // successful response
    callback()
  })
}
