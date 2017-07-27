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
  css: {
    get: req.bind({}, 'text/css'),
    post: req.bind({}, 'text/css'),
  },
  js: {
    get: req.bind({}, 'text/javascript'),
    post: req.bind({}, 'text/javascript'),
  },
}
