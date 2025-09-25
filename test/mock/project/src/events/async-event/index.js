const arc = require('../../../../../../')
const tiny = require('tiny-json-http')

async function handler(payload) {
  const url = `http://localhost:1111/events/async-event?${encodeURI(JSON.stringify(payload))}`
  await tiny.post({ url })
}

exports.handler = arc.events.subscribe(handler)
