const arc = require('../../../../../../src')

async function handler(event) {
  console.log({ body: event.body })
  const { connectionId } = event.requestContext
  const message = JSON.parse(event.body)
  if (message.message === 'hi') {
    console.log('hi')
    const info = await arc.ws.info({ id: connectionId })
    await arc.ws.send({ id: connectionId, payload: { message: 'hi back', info } })
  }
  if (message.message === 'disconnect me') {
    console.log('disconnecting')
    await arc.ws.close({ id: connectionId })
  }
  return {
    statusCode: 200,
  }
}
exports.handler = handler
