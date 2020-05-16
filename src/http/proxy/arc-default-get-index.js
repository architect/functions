// Bundler index + defaults
const GetIndexDefaultHandler = require('./public')
exports.handler = GetIndexDefaultHandler({ spa: true })
