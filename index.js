let events = require('./src/events')
let {html, json, css, js, text, xml} = require('./src/http')//DEPRECATED
let http = require('./src/http')
let ws = require('./src/ws')
let scheduled = require('./src/scheduled')
let tables = require('./src/tables')
let queues = require('./src/queues')
let middleware = require('./src/middleware')

module.exports = {
  http,
  ws,
  events,
  middleware,
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
