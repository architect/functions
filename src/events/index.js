let pubFactory = require('./publish')
let subFactory = require('./subscribe')

module.exports = function eventsAndQueuesFactory (arc, type) {
  let publish = pubFactory(arc, type)
  let subscribe = subFactory(type)
  return { publish, subscribe }
}
