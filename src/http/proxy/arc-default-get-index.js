// Bundler index + defaults
const GetIndexDefaultHandler = require('./index.js')
exports.handler = GetIndexDefaultHandler({ spa: true })
