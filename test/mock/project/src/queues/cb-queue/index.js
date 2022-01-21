let arc = require('../../../../../../')
let tiny = require('tiny-json-http')

function handler (payload, callback) {
  let url = `http://localhost:1111/queues/cb-queue?${encodeURI(JSON.stringify(payload))}`
  tiny.post({ url }, callback)
}

exports.handler = arc.queues.subscribe(handler)
