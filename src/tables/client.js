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

function promisify(obj) {
  function promised(fn) {
    return function _promisified(params, callback) {
      if (!callback) {
        return new Promise(function(res, rej) {
          fn(params, function(err, result) {
            err ? rej(err) : res(result)
          })
        })
      }
      else {
        fn(params, callback)
      }
    }
  }
  var copy = {}
  Object.keys(obj).forEach(k=> {
    copy[k] = promised(obj[k])
  })
  return copy
}
