var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var sns = new aws.SNS

/**
 * _exec accepts an array of plans and executes them in series
 */
module.exports = function _exec(plans, callback) {
  var fns = plans.map(function _plan(plan) {
    return function _handle(callback) {
      var handler = require(`./${plan.action}`)
      handler(plan, callback)
    }
  })
  waterfall(fns, callback)
}
