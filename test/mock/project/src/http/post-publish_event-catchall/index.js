let arc = require('../../../../../../')

exports.handler = async function (req) {
  let { rawPath } = req
  let parts = rawPath.split('/').filter(p => p)
  let type = parts[1]
  let name = parts[2]
  let payload = { ok: true }
  await arc[type].publish({
    name,
    payload
  })
  return payload
}
