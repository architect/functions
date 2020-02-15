/**
 * accepts an object of the form {method(params, errback)} and returns it promisified
 */
module.exports = function promisify(obj) {
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
