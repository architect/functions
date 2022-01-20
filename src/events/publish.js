let http = require('http')
let aws = require('aws-sdk')
let ledger = {}

/**
 * invoke an event lambda by sns topic name
 */
module.exports = function publishFactory (arc) {
  let publishAWS = topicFactory(arc)
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
    path: '/events',
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

function topicFactory (arc) {
  return function live ({ name, payload }, callback) {

    function publish (arn, payload, callback) {
      let sns = new aws.SNS
      sns.publish({
        TopicArn: arn,
        Message: JSON.stringify(payload)
      }, callback)
    }

    function cacheLedgerAndPublish (serviceMap) {
      ledger = serviceMap.events
      if (!arn) callback(ReferenceError(`${name} event not found`))
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
