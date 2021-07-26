let dynamo = require('./dynamo')
let promisify = require('./promisify-object')
let parallel = require('run-parallel')

/**
 * returns a data client
 */
module.exports = function reflectFactory (tables, callback) {
  let { db, doc } = dynamo
  parallel({ db, doc }, function done (err, { db, doc }) {
    if (err) throw err
    else {

      let data = Object.keys(tables).reduce((client, tablename) => {
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

      // async jic for later
      // eslint-disable-next-line
      data.reflect = async function reflect () {
        return tables
      }

      let _name = name => tables[name]
      data.name = _name
      data._name = _name

      function factory (TableName) {
        return promisify({
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
              if (err) callback(err)
              else callback(null, result.Item)
            })
          },
          put (item, callback) {
            let params = {}
            params.TableName = TableName
            params.Item = item
            doc.put(params, function _put (err) {
              if (err) callback(err)
              else callback(null, item)
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
        })
      }

      callback(null, data)
    }
  })
}
