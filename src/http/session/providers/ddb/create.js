const uid = require('uid-safe')
const week = require('./_week-from-now')
const crsf = require('csrf')
const parallel = require('run-parallel')

module.exports = function _create(name, payload, callback) {
  const { tables } = require('../../../../')

  parallel(
    [
      function _key(callback) {
        uid(18, function _uid(err, val) {
          if (err) callback(err)
          else callback(null, { _idx: val })
        })
      },
      function _secret(callback) {
        new crsf().secret(function _uid(err, val) {
          if (err) callback(err)
          else callback(null, { _secret: val })
        })
      },
    ],
    function _put(err, results) {
      if (err) throw err
      results.push({ _ttl: week() })
      const keys = results.reduce((a, b) => Object.assign(a, b))
      const session = Object.assign(payload, keys)
      tables({}, (err, data) => {
        if (err) callback(err)
        else
          data._client
            .PutItem({
              TableName: name,
              Item: session,
            })
            .then(() => callback(null, session))
            .catch(callback)
      })
    },
  )
}
