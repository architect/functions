let jwe = require('./providers/jwe')
let ddb = require('./providers/ddb')

module.exports = function read (request, callback) {
  let { ARC_SESSION_TABLE_NAME, SESSION_TABLE_NAME } = process.env
  if ([ ARC_SESSION_TABLE_NAME, SESSION_TABLE_NAME ].includes('jwe')) {
    return jwe.read(request, callback)
  }
  return ddb.read(request, callback)
}
