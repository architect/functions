const arc = require('../../../../../../')

exports.handler = async (req) => {
  const { rawPath } = req
  const parts = rawPath.split('/').filter((p) => p)
  const type = parts[1]
  const name = parts[2]
  const payload = { ok: true }
  await arc[type].publish({
    name,
    payload,
  })
  return payload
}
