const arc = require('../../../../../../')
const tiny = require('tiny-json-http')

async function handler(payload) {
  const url = `http://localhost:1111/queues/async-queue?${encodeURI(JSON.stringify(payload))}`
  await tiny.post({ url })
}

exports.handler = arc.queues.subscribe(handler)
