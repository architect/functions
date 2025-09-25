async function handler() {
  console.log('disconnect')
  return {
    statusCode: 200,
  }
}

exports.handler = handler
