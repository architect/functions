let promisify = require('./promisify')

module.exports = function clientFactory(doc, TableName) {
  return promisify({
    delete(key, callback) {
      let params = {}
      params.TableName = TableName
      params.Key = key
      doc.delete(params, callback)
    },
    get(key, callback) {
      let params = {}
      params.TableName = TableName
      params.Key = key
      doc.get(params, function _get(err, result) {
        if (err) callback(err)
        else callback(null, result.Item)
      })
    },
    put(item, callback) {
      let params = {}
      params.TableName = TableName
      params.Item = item
      doc.put(params, function _put(err) {
        if (err) callback(err)
        else callback(null, item)
      })
    },
    query(params, callback) {
      params.TableName = TableName
      doc.query(params, callback)
    },
    scan(params, callback) {
      params.TableName = TableName
      doc.scan(params, callback)
    },
    update(params, callback) {
      params.TableName = TableName
      doc.update(params, callback)
    }
  })
}
