var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var zip = require('zipit')
var path = require('path')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var sns = new aws.SNS
var getIAM = require('./_get-iam-role')

/**
 * creates sns lambdas
 *
 * - app-name-staging-event-name
 * - app-name-production-event-name
 */

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String,
    event: String,
  })
      
  function _create(stage, callback) {
    lambda.getFunction({FunctionName:stage}, function _gotFn(err, result) {
      if (err && err.name === 'ResourceNotFoundException') {
        console.log('creating ' + stage)
        _createLambda(params.event, stage, callback)
      }
      else if (err) {
        console.log(err)
        callback(err)
      }
      else {
        // noop if it exists
        console.log('skip create?')
        console.log(result)
        callback()
      }
    })
  }

  var staging = _create.bind({}, `${params.app}-staging-${params.event}`)
  var production = _create.bind({}, `${params.app}-production-${params.event}`)

  parallel([
    staging,
    production,
  ], 
  function _done(err) {
    if (err) {
      console.log(err)
    }
    callback()
  })  
}

function _createLambda(event, env, callback) {
  waterfall([
    // gets the IAM role for lambda execution
    function _getRole(callback) {
      getIAM(callback)    
    },
    function _readCode(role, callback) {
      zip({
        input: [
          `src/events/${event}/index.js`,
          `src/events/${event}/package.json`,
          `src/events/${event}/node_modules`
        ],
        cwd: process.cwd()
      }, 
      function _zip(err, buffer) {
        if (err) {
          callback(err)
          console.log(err)
        }
        else {
          callback(null, buffer, role)
        }
      })
    },
    function _createFunc(zip, role, callback) {
      lambda.createFunction({
        Code: {
          ZipFile: zip
        }, 
        Description: "", 
        FunctionName: env, 
        Handler: "index.handler",
        MemorySize: 1152, 
        Publish: true, 
        Role: role.Arn, 
        Runtime: "nodejs6.10", 
        Timeout: 5, 
        Environment: {
          Variables: {
            'NODE_ENV': env.includes('staging')? 'staging' : 'production',
          }
        }
      },
      function _createFn(err, result) {
        if (err && err.name != 'ResourceConflictException') {
          console.log(err)
          callback(err)
        }
        else if (err && err.name == 'ResourceConflictException') {
          lambda.getFunction({FunctionName:env}, function _gotFn(err, data) {
            if (err) {
              callback(err)
            }
            else {
              callback(null, data.Configuration.FunctionArn)
            }
          })
        }
        else {
          callback(null, result.FunctionArn)
        }
      })
    },
    function _subscribeLambda(lambdaArn, callback) {
      // the sns topic name === lambda name
      sns.listTopics({}, function(err, data) {
        if (err) {
          console.log(err)
          callback(err)
        }
        else {    
          var topicArn
          data.Topics.forEach(t=> {
            var parts = t.TopicArn.split(':')
            var last = parts[parts.length - 1]      
            var found = last === env
            if (found) {
              topicArn = t.TopicArn
            }
          })
          sns.subscribe({
            Protocol: 'lambda',
            TopicArn: topicArn,
            Endpoint: lambdaArn,
          }, 
          function(err, data) {
            if (err) {
              console.log(err)
            }
            console.log(data)
            callback(null, topicArn)
          })
        }
      })
    },
    function _addSnsPermission(topicArn, callback) {
      lambda.addPermission({
        FunctionName: env, 
        Action: "lambda:InvokeFunction", 
        Principal: "sns.amazonaws.com", 
        StatementId: "idx-1" + Date.now(),
        SourceArn: topicArn, 
      }, 
      function _addPermission(err, result) {
        if (err) {
          console.log(err)
        } 
        console.log(result)
        callback()
      })
    }],
    function _done(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
