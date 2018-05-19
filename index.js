let events = require('./src/events')
let {html, json, css, js, text, xml} = require('./src/http')
let scheduled = require('./src/scheduled')
let tables = require('./src/tables')

module.exports = {
  events,
  html,
  json,
  css,
  js,
  text,
  xml,
  scheduled,
  tables,
}
