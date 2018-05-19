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
    put: req.bind({}, 'application/json'),
    delete: req.bind({}, 'application/json'),
    patch: req.bind({}, 'application/json'),
  },
  css: {
    get: req.bind({}, 'text/css'),
  },
  js: {
    get: req.bind({}, 'text/javascript'),
  },
  text: {
    get: req.bind({}, 'text/plain'),
  },
  xml: {
    get: req.bind({}, 'application/xml'),
    post: req.bind({}, 'application/xml'),
    put: req.bind({}, 'application/xml'),
    delete: req.bind({}, 'application/xml'),
    patch: req.bind({}, 'application/xml'),
  },
}
