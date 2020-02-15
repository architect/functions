let waterfall = require('run-waterfall')
let dynamo = require('./dynamo')
let lookup = require('../discovery')

module.exports = function discovery(callback) {
  let testing = process.env.NODE_ENV === 'testing'
  if (!testing) {
    lookup.tables(callback)
  }
  else {
    waterfall([
      dynamo.db,
      function(db, callback) {
        db.listTables({}, function list(err, result) {
          if (err) callback(err)
          else {
            let reduce = (a, b)=> Object.assign({}, a, b)
            let dontcare = tbl=> tbl != 'arc-sessions' && tbl.includes('production') === false
            let tables = result.TableNames.filter(dontcare)
            let data = tables.map(function fmt(tbl) {
              let parts = tbl.split('-staging-')
              parts.shift() // remove appname
              let name = parts.join('')
              let r = {}
              r[name] = tbl
              return r
            }).reduce(reduce, {})
            callback(null, data)
          }
        })
      }
    ], callback)
  }
}
