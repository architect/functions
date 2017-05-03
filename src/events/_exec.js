var waterfall = require('run-waterfall')
var aws = require('aws-sdk')
var sns = new aws.SNS
var createSnsLambdaCode = require('./plans/create-sns-lambda-code')
var createSnsTopic = require('./plans/create-sns-topic'
var createSnsLambdaDeployment = require('./plans/create-sns-lambda-deployment')

module.exports = function _exec(plans, callback) {
  var actions = {
    'create-sns-lambda-code': createSnsLambdaCode,
    'create-sns-topic': createSnsTopic,
    'create-sns-lambda-deployment': createSnsLambdaDeployment,
  }
  waterfall(plans.map(function _plan(plan) {
    return function _handle(callback) {
      actions[plan.action].bind({}, plan, callback)
    }
  }), callback)
}
