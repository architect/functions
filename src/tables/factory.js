let dynamo = require('./dynamo')
let parallel = require('run-parallel')

/**
 * returns a data client
 */
module.exports = function reflectFactory (tables, callback) {
  let local = process.env.ARC_ENV === 'testing'

  parallel(dynamo, function done (err, { db, doc }) {
    if (err) return callback(err)

    let data = Object.keys(tables)
      .filter(name => {
        if (local && !name.includes('-production-')) return name
        return name
      })
      .reduce((client, fullName) => {
        let name = local ? fullName.replace(/.+-staging-/, '') : fullName
        client[name] = factory(tables[name])
        return client
      }, {})

    let enumerable = false
    Object.defineProperty(data, '_db',  { enumerable, value: db })
    Object.defineProperty(data, '_doc', { enumerable, value: doc })

    // async jic for later
    // eslint-disable-next-line
    data.reflect = async () => tables

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
        scanAll (params = {}, callback) {
          let records = []
          params.TableName = TableName
          function getRecords () {
            db.scan(params, (err, data) => {
              if (err) callback(err)
              else {
                data.Items.forEach(d => records.push(d))
                if (data.LastEvaluatedKey) {
                  params.ExclusiveStartKey = data.LastEvaluatedKey
                  getRecords()
                }
                else {
                  callback(null, records)
                }
              }
            })
          }
          getRecords()
        },
        update (params, callback) {
          params.TableName = TableName
          doc.update(params, callback)
        }
      })
    }

    callback(null, data)
  })
}

// accepts an object and promisifies all keys
function promisify (obj) {
  let copy = {}
  Object.keys(obj).forEach(k => {
    copy[k] = promised(obj[k])
  })
  return copy
}

// Accepts an errback style fn and returns a promisified fn
function promised (fn) {
  return function _promisified (params, callback) {
    if (!callback) {
      return new Promise(function (res, rej) {
        fn(params, function (err, result) {
          err ? rej(err) : res(result)
        })
      })
    }
    else {
      fn(params, callback)
    }
  }
}
