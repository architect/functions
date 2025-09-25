const pubFactory = require('./publish')
const subFactory = require('./subscribe')

module.exports = function eventsAndQueuesFactory(arc, type) {
  const publish = pubFactory(arc, type)
  const subscribe = subFactory(type)
  return { publish, subscribe }
}
