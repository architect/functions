const promisifyObject = require('./promisify-object')
const parallel = require('run-parallel')

const stagingTables = tbl => !tbl.includes('-production-')

function client (doc, TableName) {
  let client = {
    delete (key, callback) {
      let params = {}
      params.TableName = TableName
      params.Key = key
      doc.delete(params, callback)
    },
    get (key, callback) {
      let params = {}
      params.TableName = TableName
      params.Key = key
      doc.get(params, function _get (err, result) {
        if (err) {
          callback(err)
        }
        else {
          callback(null, result.Item)
        }
      })
    },
    put (item, callback) {
      let params = {}
      params.TableName = TableName
      params.Item = item
      doc.put(params, function _put (err) {
        if (err) {
          callback(err)
        }
        else {
          callback(null, item)
        }
      })
    },
    query (params, callback) {
      params.TableName = TableName
      doc.query(params, callback)
    },
    scan (params = {}, callback) {
      params.TableName = TableName
      doc.scan(params, callback)
    },
    update (params, callback) {
      params.TableName = TableName
      doc.update(params, callback)
    }
  }
  return promisifyObject(client)
}

/**
 * returns a data client
 */
module.exports = function sandbox (dynamo, callback) {
  function done (err, results) {
    if (err) {
      return callback(err)
    }

    const db = results[0]
    const doc = results[1]

    db.listTables({}, function listed (err, result) {
      if (err) {
        return callback(err)
      }
      const tables = result.TableNames.filter(stagingTables)
      const data = {}
      const tableMap = {}
      tables.forEach(fullTableName => {
        const tableName = fullTableName.replace(/.+-staging-/, '')
        tableMap[tableName] = fullTableName
        data[tableName] = client(doc, fullTableName)
      })

      Object.defineProperty(data, '_db', {
        enumerable: false,
        value: db
      })

      Object.defineProperty(data, '_doc', {
        enumerable: false,
        value: doc
      })

      // async jic for later
      // eslint-disable-next-line
      data.reflect = async () => tableMap

      let _name = tableName => tableMap[tableName]
      data.name = _name
      data._name = _name

      callback(null, data)
    })
  }

  parallel([ dynamo.db, dynamo.doc ], done)
}
