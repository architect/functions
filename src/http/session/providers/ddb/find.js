let create = require('./create')

module.exports = function _find (name, _idx, callback) {
  let { tables } = require('../../../../')

  tables({}, (err, data) => {
    if (err) callback(err)
    else data._client.GetItem({
      TableName: name,
      ConsistentRead: true,
      Key: { _idx }
    })
      .then(item => {
        let result = typeof item === 'undefined' ? false : item.Item
        if (result?._secret) {
          callback(null, result)
        }
        else {
          create(name, {}, callback)
        }
      })
      .catch(callback)
  })
}
