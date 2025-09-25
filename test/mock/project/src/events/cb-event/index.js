const arc = require('../../../../../../')
const tiny = require('tiny-json-http')

function handler(payload, callback) {
  const url = `http://localhost:1111/events/cb-event?${encodeURI(JSON.stringify(payload))}`
  tiny.post({ url }, callback)
}

exports.handler = arc.events.subscribe(handler)
