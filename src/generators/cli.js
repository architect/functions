var path = require('path')
var generate = require('.')

generate({
  arcFile: path.join(process.cwd(), '.arc'),
  execute: true
}, console.log)
