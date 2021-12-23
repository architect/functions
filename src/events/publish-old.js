/* eslint global-require: "off" */
let http = require('http')
let aws = require('aws-sdk')
let sns = new aws.SNS
let ledger = {}

// priv publish
// blindly publishes to sns topic json stringified record
// throws if fails so lambda errors are noticible
function __publish (arn, payload, callback) {
  sns.publish({
    TopicArn: arn,
    Message: JSON.stringify(payload)
  },
  function _published (err, result) {
    if (err) throw err
    callback(null, result)
  })
}

/**
 * invoke an event lambda by name
 *
 * usage
 *
 *   let arc = require('@smallwins/arc-prototype')
 *
 *   arc.events.publish({
 *     name: 'eventname',
 *     payload: {hello: 'world'},
 *   }, console.log)
 *
 * this will invoke appname-staging-eventname (or appname-production-eventname)
 *
 * you can invoke events for other arc apps in the same region by overriding appname with app param like so:
 *
 *   arc.events.publish({
 *     app: 'otherappname',
 *     name: 'eventname',
 *     payload: {hello: 'world2'},
 *   }, console.log)
 */
module.exports = function _publish (params, callback) {
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

  let isLocal = process.env.ARC_ENV === 'testing' || process.env.ARC_LOCAL
  let exec = isLocal ? _local : _live
  exec(params, callback)
  return promise
}

function _live (params, callback) {
  let { name, payload } = params
  let arn = ledger[name]

  if (arn) {
    __publish(ledger[name], payload, callback)
  }
  else {
    let override = params.app
    let eventName = `${override ? params.app : process.env.ARC_APP_NAME}-${process.env.ARC_ENV}-${name}`
    _scan({ eventName }, function _scan (err, found) {
      if (err) throw err
      // cache the arn here
      ledger[name] = found
      // and continue
      __publish(ledger[name], payload, callback)
    })
  }
}

function _local (params, callback) {
  let port = process.env.ARC_EVENTS_PORT || 3334
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

function _scan ({ eventName }, callback) {
  let sns = new aws.SNS()
  ;(function __scanner (params = {}, callback) {
    sns.listTopics(params, function _listTopics (err, results) {
      if (err) throw err
      let found = results.Topics.find(t => {
        let bits = t.TopicArn.split(':')
        let it = bits[bits.length - 1]
        return it === eventName
      })
      if (found) {
        callback(null, found.TopicArn)
      }
      else if (results.NextToken) {
        setTimeout(() => {
          // 30tps on sns.listTopics, so let's give just a bit of buffer
          __scanner({ NextToken: results.NextToken }, callback)
        }, 50)
      }
      else {
        callback(Error(`topic ${eventName} not found`))
      }
    })
  })({}, callback)
}
