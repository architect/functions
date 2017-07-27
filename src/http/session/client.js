var _read = require('./_read')
var _write = require('./_write')

module.exports = function client(name) {
  return {
    read: _read.bind({}, name),
    write: _write.bind({}, name),
  }
}
