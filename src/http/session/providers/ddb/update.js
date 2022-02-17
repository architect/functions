let { doc: dynamo } = require('../../../../tables/dynamo')
let week = require('./_week-from-now')

module.exports = function _update (name, payload, callback) {
  let _ttl = week()
  let session = Object.assign(payload, { _ttl })
  dynamo(function _gotDB (err, db) {
    if (err) callback(err)
    else {
      db.put({
        TableName: name,
        Item: session
      },
      function _create (err) {
        if (err) callback(err)
        else callback(null, session)
      })
    }
  })
}
