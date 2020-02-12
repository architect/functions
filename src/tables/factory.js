let dynamo = require('./dynamo')
let promisify = require('./promisify-object')
let parallel = require('run-parallel')

/**
 * returns a data client
 */
module.exports = function reflectFactory(tables) {
  parallel([
    dynamo.db,
    dynamo.doc
  ],
  function _done(err, results) {
    if (err) throw err
    else {
      let db = results[0]
      let doc = results[1]

      let data = Object.keys(tables).reduce((client, tablename)=> {
        client[tablename] = factory(tables[tablename])
        return client
      }, {})

      Object.defineProperty(data, '_db', {
        enumerable: false,
        value: db
      })

      Object.defineProperty(data, '_doc', {
        enumerable: false,
        value: doc
      })

      data.reflect = async function reflect() {
        return tables
      }

      data._name = function _name(name) {
        return tables.filter(t => RegExp(`^.*${name}$`).test(t))
      }

      function factory(TableName) {
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

      return data
    }
  })
}
