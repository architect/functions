const jwe = require('./providers/jwe')
const ddb = require('./providers/ddb')

module.exports = function write(params, callback) {
  const { ARC_SESSION_TABLE_NAME, SESSION_TABLE_NAME } = process.env
  if ([ARC_SESSION_TABLE_NAME, SESSION_TABLE_NAME].includes('jwe')) {
    return jwe.write(params, callback)
  }
  return ddb.write(params, callback)
}
