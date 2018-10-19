let events = require('./src/events')
let {html, json, css, js, text, xml} = require('./src/http')//DEPRECATED
let http = require('./src/http')
let scheduled = require('./src/scheduled')
let tables = require('./src/tables')
let queues = require('./src/queues')

module.exports = {
  http,
  events,
  queues,
  scheduled,
  tables,

  // DEPRECATED
  html,
  json,
  css,
  js,
  text,
  xml,
}
