const http = require('node:http')
const { getAwsClient, getPorts, useAWS } = require('../lib')
const ledger = { events: {}, queues: {} }
let client
let port

/**
 * Invoke
 * - `@events` Lambdas by EventBridge topic name
 * - `@queues` Lambdas by SQS queue name
 */
module.exports = function publishFactory(arc, type) {
  const factory = type === 'events' ? eventFactory : queueFactory
  return function publish(params, callback) {
    if (!params.name) {
      throw ReferenceError('missing params.name')
    }
    if (!params.payload) {
      throw ReferenceError('missing params.payload')
    }

    let promise
    if (!callback) {
      promise = new Promise((resolve, reject) => {
        callback = function errback(err, result) {
          err ? reject(err) : resolve(result)
        }
      })
    }

    const local = !useAWS()
    if (local && port) {
      _publishSandbox(type, params, callback)
    } else if (local) {
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
    } else if (client) {
      const publishAWS = factory(arc)
      publishAWS(params, callback)
    } else {
      getAwsClient(
        {
          plugins: [import('@aws-lite/sns'), import('@aws-lite/sqs')],
        },
        (err, _client) => {
          if (err) callback(err)
          else {
            client = _client
            const publishAWS = factory(arc)
            publishAWS(params, callback)
          }
        },
      )
    }

    return promise
  }
}

function _publishSandbox(type, params, callback) {
  const req = http.request(
    {
      method: 'POST',
      port,
      path: `/${type}`,
    },
    function done(res) {
      const data = []
      res.resume()
      res.on('data', (chunk) => data.push(chunk))
      res.on('end', () => {
        const body = Buffer.concat(data).toString()
        const code = `${res.statusCode}`
        if (!code.startsWith(2)) callback(Error(`${body} (${code})`))
        else callback(null, body)
      })
    },
  )
  req.write(JSON.stringify(params))
  req.end('\n')
}

function eventFactory(arc) {
  return function live({ name, payload }, callback) {
    function publish(arn, payload, callback) {
      client.sns
        .Publish({
          TopicArn: arn,
          Message: JSON.stringify(payload),
        })
        .then((result) => callback(null, result))
        .catch(callback)
    }

    function cacheLedgerAndPublish(serviceMap) {
      ledger.events = serviceMap.events
      arn = ledger.events[name]
      if (!arn) callback(ReferenceError(`${name} event not found`))
      else publish(arn, payload, callback)
    }

    let arn = ledger.events[name]
    if (arn) {
      publish(arn, payload, callback)
    } else {
      arc.services().then(cacheLedgerAndPublish).catch(callback)
    }
  }
}

function queueFactory(arc) {
  return function live({ name, payload, delaySeconds, groupID }, callback) {
    function publish(url, payload, callback) {
      const params = {
        QueueUrl: url,
        DelaySeconds: delaySeconds || 0,
        MessageBody: JSON.stringify(payload),
      }
      if (url.endsWith('.fifo')) {
        params.MessageGroupId = groupID || name
      }
      client.sqs
        .SendMessage(params)
        .then((result) => callback(null, result))
        .catch(callback)
    }

    function cacheLedgerAndPublish(serviceMap) {
      ledger.queues = serviceMap.queues
      url = ledger.queues[name]
      if (!url) callback(ReferenceError(`${name} queue not found`))
      else publish(url, payload, callback)
    }

    let url = ledger.queues[name]
    if (url) {
      publish(url, payload, callback)
    } else {
      arc.services().then(cacheLedgerAndPublish).catch(callback)
    }
  }
}
