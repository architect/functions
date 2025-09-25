let arc = require('../../../../../../')
let tiny = require('tiny-json-http')

async function handler (payload) {
  let url = `http://localhost:1111/queues/async-queue?${encodeURI(JSON.stringify(payload))}`
  await tiny.post({ url })
}

exports.handler = arc.queues.subscribe(handler)
