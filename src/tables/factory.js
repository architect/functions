let parallel = require('run-parallel')
let dynamo = require('./dynamo')
let clientFactory = require('./client')

/**
 * returns a data client
 */
module.exports = function reflectFactory(tables, callback) {

  // grab the dynamo client
  let {db, doc} = dynamo
  parallel({db, doc}, function done(err, {db, doc}) {
    if (err) {
      callback(err)
    }
    else {

      // generate a dynamodb client for each table
      let data = Object.keys(tables).reduce((client, tablename)=> {
        client[tablename] = clientFactory(doc, tables[tablename])
        return client
      }, {})

      // hidden accessor for the low level dynamodb client
      Object.defineProperty(data, '_db', {
        enumerable: false,
        value: db
      })

      // hidden accesssor for the high level dynamodb document client
      Object.defineProperty(data, '_doc', {
        enumerable: false,
        value: doc
      })

      // read back the tables names
      data.reflect = async function reflect() {
        return tables
      }

      // old helper for compatability
      data._name = function _name(name) {
        return tables.filter(t => RegExp(`^.*${name}$`).test(t))
      }

      callback(null, data)
    }
  })
}
