var db = require('./_get-dynamo-doc-instance')

module.exports = function _find(name, _idx, callback) {
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
      callback(null, data.Item)
    }
  })
}
