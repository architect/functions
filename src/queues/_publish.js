let http = require('http')
let waterfall = require('run-waterfall')
let aws = require('aws-sdk')

/**
 * invoke an sqs lambda by name
 *
 * usage
 *
 *   let arc = require('@architect/functions')
 *
 *   arc.queues.publish({
 *     name: 'queue-name-here',
 *     payload: {hello: 'world'},
 *   }, console.log)
 *
 */
module.exports = function _publish(params, callback) {
  // ensure required input
  if (!params.name)
    throw ReferenceError('missing params.name')
  if (!params.payload)
    throw ReferenceError('missing params.payload')

  let promise
  if (!callback) {
    promise = new Promise((resolve, reject) => {
      callback = (err, result) => err ? reject(err) : resolve(result)
    })
  }

  // check if we're running locally
  let local = process.env.NODE_ENV === 'testing' && !process.env.hasOwnProperty('ARC_LOCAL')
  if (local) {
    _local(params, callback)
  } else {
    _live(params, callback)
  }
  return promise
}

function _local ({name, payload, delay}, callback) {
  // send a fake event to the local loopback service
  let lambda = 'queues/' + name
  let event = {Records:[{body: JSON.stringify(payload)}]}
  let req = http.request({method: 'POST', port: 3334})
  req.write(JSON.stringify({lambda, event, delay}))
  req.end()
  req.on('response', function (res) {
    if (res.statusCode == 200) {
      callback()
    } else {
      let chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => callback(new Error(Buffer.concat(chunks).toString())))
    }
  })
}

function _live({name, payload, delay}, callback) {
  let sqs = new aws.SQS
  waterfall([
    function reads(callback) {
      sqs.getQueueUrl({
        // queue name normalized with appname and env
        QueueName: `${process.env.ARC_APP_NAME}-${process.env.NODE_ENV}-${name}`,
      }, callback)
    },
    function  publishes(result, callback) {
      let QueueUrl = result.QueueUrl
      console.log('sqs.sendMessage', JSON.stringify({QueueUrl, payload}))
      sqs.sendMessage({
        QueueUrl,
        DelaySeconds: delay,
        MessageBody: JSON.stringify(payload)
      }, callback)
    }
  ],
  function _published(err, result) {
    if (err) throw err
    callback(null, result)
  })
}