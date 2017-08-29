var html = require('./_html')
var json = require('./_json')

module.exports = function validate(type, cmds) {
  var validators = {
    'text/html': html,
    'application/json': json,
  }
  return validators[type](cmds)
}
