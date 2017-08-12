var _read = require('./_read')
var _write = require('./_write')
var _create = require('./_create')
var _update= require('./_update')
var _find = require('./_find')

module.exports = function client(name) {
  return {
    read: _read.bind({}, name),
    write: _write.bind({}, name),
    _create: _create.bind({}, name),
    _update: _update.bind({}, name),
    _find: _find.bind({}, name),
  }
}
