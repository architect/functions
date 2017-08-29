var csrf = require('./helpers/_csrf')
var req = require('./_request')

module.exports = {
  html: {
    csrf,
    get: req.bind({}, 'text/html'),
    post: req.bind({}, 'text/html'),
  },
  json: {
    get: req.bind({}, 'application/json'),
    post: req.bind({}, 'application/json'),
  },
}
