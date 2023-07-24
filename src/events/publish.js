let http = require('http')
let { getPorts, isNode18, useAWS } = require('../lib')
let ledger = { events: {}, queues: {} }
let snsClient, sqsClient, port

/**
 * Invoke
 * - `@events` Lambdas by EventBridge topic name
 * - `@queues` Lambdas by SQS queue name
 */
module.exports = function publishFactory (arc, type) {
  let factory = type === 'events' ? eventFactory : queueFactory
  let publishAWS = factory(arc)
  return function publish (params, callback) {
    if (!params.name) {
      throw ReferenceError('missing params.name')
    }
    if (!params.payload) {
      throw ReferenceError('missing params.payload')
    }

    let promise
    if (!callback) {
      promise = new Promise((resolve, reject) => {
        callback = function errback (err, result) {
          err ? reject(err) : resolve(result)
        }
      })
    }

    let local = !useAWS()
    if (local && port) {
      _publishSandbox(type, params, callback)
    }
    else if (local) {
      getPorts((err, ports) => {
        if (err) callback(err)
        else {
          port = ports.events
          if (!port) {
            return callback(ReferenceError('Sandbox events port not found'))
          }
          _publishSandbox(type, params, callback)
        }
      })
    }
    else {
      publishAWS(params, callback)
    }

    return promise
  }
}

function _publishSandbox (type, params, callback) {
  let req = http.request({
    method: 'POST',
    port,
    path: '/' + type,
  },
  function done (res) {
    let data = []
    res.resume()
    res.on('data', chunk => data.push(chunk))
    res.on('end', () => {
      let body = Buffer.concat(data).toString()
      let code = `${res.statusCode}`
      if (!code.startsWith(2)) callback(Error(`${body} (${code})`))
      else callback(null, body)
    })
  })
  req.write(JSON.stringify(params))
  req.end('\n')
}

function eventFactory (arc) {
  return function live ({ name, payload }, callback) {
    let sns
    if (!snsClient) {
      if (isNode18) {
        let { SNS } = require('@aws-sdk/client-sns')
        sns = new SNS
      }
      else {
        let SNS = require('aws-sdk/clients/sns')
        sns = new SNS
      }
    }
    snsClient = (params, callback) => {
      return sns.publish(params, callback)
    }

    function publish (arn, payload, callback) {
      snsClient({
        TopicArn: arn,
        Message: JSON.stringify(payload)
      }, callback)
    }

    function cacheLedgerAndPublish (serviceMap) {
      ledger.events = serviceMap.events
      arn = ledger.events[name]
      if (!arn) callback(ReferenceError(`${name} event not found`))
      else publish(arn, payload, callback)
    }

    let arn = ledger.events[name]
    if (arn) {
      publish(arn, payload, callback)
    }
    else {
      arc.services().then(cacheLedgerAndPublish).catch(callback)
    }
  }
}

function queueFactory (arc) {
  return function live ({ name, payload, delaySeconds, groupID }, callback) {
    let sqs
    if (!sqsClient) {
      if (isNode18) {
        let { SQS } = require('@aws-sdk/client-sqs')
        sqs = new SQS
      }
      else {
        let SQS = require('aws-sdk/clients/sqs')
        sqs = new SQS
      }
    }
    sqsClient = (params, callback) => {
      return sqs.sendMessage(params, callback)
    }

    function publish (arn, payload, callback) {
      let params = {
        QueueUrl: arn,
        DelaySeconds: delaySeconds || 0,
        MessageBody: JSON.stringify(payload)
      }
      if (arn.endsWith('.fifo')) {
        params.MessageGroupId = groupID || name
      }
      sqsClient(params, callback)
    }

    function cacheLedgerAndPublish (serviceMap) {
      ledger.queues = serviceMap.queues
      arn = ledger.queues[name]
      if (!arn) callback(ReferenceError(`${name} queue not found`))
      else publish(arn, payload, callback)
    }

    let arn = ledger.queues[name]
    if (arn) {
      publish(arn, payload, callback)
    }
    else {
      arc.services().then(cacheLedgerAndPublish).catch(callback)
    }
  }
}
