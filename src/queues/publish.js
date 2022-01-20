let http = require('http')
let aws = require('aws-sdk')
let ledger = {}

/**
 * invoke a queue lambda by sqs queue name
 */
module.exports = function publishFactory (arc) {
  let publishAWS = queueFactory(arc)
  return function publish (params, callback) {

    if (!params.name)
      throw ReferenceError('missing params.name')

    if (!params.payload)
      throw ReferenceError('missing params.payload')

    let promise
    if (!callback) {
      promise = new Promise((resolve, reject) => {
        callback = function errback (err, result) {
          err ? reject(err) : resolve(result)
        }
      })
    }
    let { ARC_ENV: env, ARC_EVENTS_PORT: port, ARC_LOCAL } = process.env
    let local = env === 'testing' || ARC_LOCAL
    if (local && !port) {
      callback(ReferenceError('ARC_EVENTS_PORT env var not found'))
      return promise
    }

    let exec = local ? publishSandbox : publishAWS
    exec(params, callback)
    return promise
  }
}

function publishSandbox (params, callback) {
  let port = process.env.ARC_EVENTS_PORT
  let req = http.request({
    method: 'POST',
    port,
    path: '/queues',
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

function queueFactory (arc) {
  return function live ({ name, payload, delaySeconds, groupID }, callback) {

    function publish (arn, payload, callback) {
      let sqs = new aws.SQS
      let params = {
        QueueUrl: arn,
        DelaySeconds: delaySeconds || 0,
        MessageBody: JSON.stringify(payload)
      }
      if (arn.endsWith('.fifo')) {
        params.MessageGroupId = groupID || name
      }
      sqs.sendMessage(params, callback)
    }

    function cacheLedgerAndPublish (serviceMap) {
      ledger = serviceMap.queues
      if (!arn) callback(ReferenceError(`${name} queue not found`))
      else publish(arn, payload, callback)
    }

    let arn = ledger[name]
    if (arn) {
      publish(arn, payload, callback)
    }
    else {
      arc.services().then(cacheLedgerAndPublish).catch(callback)
    }
  }
}
