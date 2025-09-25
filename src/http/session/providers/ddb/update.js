const week = require('./_week-from-now')

module.exports = function _update(name, payload, callback) {
  const { tables } = require('../../../../')
  const _ttl = week()
  const session = Object.assign(payload, { _ttl })
  tables({}, (err, data) => {
    if (err) callback(err)
    else
      data._client
        .PutItem({
          TableName: name,
          Item: session,
        })
        .then(() => callback(null, session))
        .catch(callback)
  })
}
