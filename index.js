let events = require('./src/events')
let {session, helpers, html, json, css, js, text, xml} = require('./src/http')
let scheduled = require('./src/scheduled')
let tables = require('./src/tables')
let queues = require('./src/queues')

module.exports = {
  events,
  http: {session, helpers},
  html,
  json,
  css,
  js,
  text,
  xml,
  scheduled,
  tables,
  queues,
}
