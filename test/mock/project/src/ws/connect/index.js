// eslint-disable-next-line require-await
async function handler () {
  console.log('connect')
  return {
    statusCode: 200
  }
}

exports.handler = handler
