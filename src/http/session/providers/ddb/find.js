let dynamo = require('../../../../tables/dynamo').session
let create = require('./create')

module.exports = function _find(name, _idx, callback) {
  dynamo(function _gotDB(err, db) {
    if (err) callback(err)
    else {
      db.get({
        TableName: name,
        ConsistentRead: true,
        Key: {_idx}
      },
      function _get(err, data) {
        if (err) {
          callback(err)
        }
        else {
          let result = typeof data === 'undefined'? false : data.Item
          if (result && result.hasOwnProperty('_secret')) {
            callback(null, result)
          }
          else {
            create(name, {}, callback)
          }
        }
      })
    }
  })
}
