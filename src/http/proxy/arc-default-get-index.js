const GetIndexDefaultHandler = require('./public')

// Bundler index + defaults
exports.handler = GetIndexDefaultHandler({spa: true})
