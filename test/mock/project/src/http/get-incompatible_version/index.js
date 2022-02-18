// eslint-disable-next-line
exports.handler = async event => {
  process.env.ARC_SANDBOX = JSON.stringify({ version: '4.0.0' })
  // eslint-disable-next-line
  let arc = require('../../../../../../src')
  return { ok: true }
}
