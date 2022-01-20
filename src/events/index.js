let pubFactory = require('./publish')
let subFactory = require('./subscribe')

module.exports = function eventsAndQueuesFactory (arc, type) {
  let publish = pubFactory(arc, type)
  let subscribe = subFactory(type)
  return {
    /**
     * `arc.events|queues.publish`
     * publish events and queues
     *
     * @param {Object} params
     * @param {String} params.name - the event name (required)
     * @param {String} params.payload - a json event payload (required)
     * @param {Function} callback - a node style errback (optional)
     * @returns {Promise} - returned if no callback is supplied
     */
    publish,

    /**
     * `arc.events|queues.subscribe`
     * listen for events and queues
     *
     * @param {Function} handler - a single event handler function
     * @returns {Lambda} - a Lambda function sig
     */
    subscribe
  }
}
