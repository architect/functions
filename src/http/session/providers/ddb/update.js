let week = require('./_week-from-now')

module.exports = function _update (name, payload, callback) {
  let { tables } = require('../../../../')
  let _ttl = week()
  let session = Object.assign(payload, { _ttl })
  tables({}, (err, data) => {
    if (err) callback(err)
    else data._client.PutItem({
      TableName: name,
      Item: session
    }).then(() => callback(null, session)).catch(callback)
  })
}
