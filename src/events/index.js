let pubFactory = require('./publish')
let subFactory = require('./subscribe')

module.exports = function eventsAndQueuesFactory (arc, type) {
  let publish = pubFactory(arc, type)
  let subscribe = subFactory(type)
  return {
    /**
     * `arc.events|queues.publish`
     * publish to events and queues
     *
     * @param {{name: String, payload: Object}} params an object with the event name and payload
     * @param {(error: Error, result: any) => void} [callback] a node style errback (optional)
     * @returns {Promise<void> | void} returned if no callback is supplied
     */
    publish,

    /**
     * `arc.events|queues.subscribe`
     * listen for events and queues
     *
     * @param {(event: any) => void} handler an event handler function
     * @returns {Function} a Lambda handler function
     */
    subscribe
  }
}
