var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var sns = new aws.SNS

module.exports = function _exec(plans, callback) {
  waterfall(plans.map(function _plan(plan) {
    return function _handle(callback) {
      actions[require(plan.action)].bind({}, plan, callback)
    }
  }), callback)
}
