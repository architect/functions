var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var zip = require('zipit')
var path = require('path')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var getIAM = require('./_get-iam-role')

/**
 * creates app-name-staging-event-name
 * and app-name-production-event-name
 */

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    event: String,
    app: String,
  })

  parallel([
    function (callback) {
      var staging = `${params.app}-staging-${params.event}`
      _createLambda(params.event, staging, callback)
    },
    function (callback) {
      var production = `${params.app}-production-${params.event}`
      _createLambda(params.event, production, callback)
    }
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
        },
        function _createFn(err, result) {
          if (err && err.name != 'ResourceConflictException') {
            console.log(err)
            callback(err)
          }
          else if (err && err.name == 'ResourceConflictException') {
            console.log('skipping create; lambda already exists')
            callback()
          }
          else {
            console.log(result)
            callback()
          }
        })
      },
      /*
      function _addSnsPermission(callback) {
        console.log('add sns perm')
      lambda.addPermission({
        Action: "lambda:InvokeFunction", 
        FunctionName: "MyFunction", 
        Principal: "s3.amazonaws.com", 
        SourceAccount: "123456789012", 
        SourceArn: "arn:aws:s3:::examplebucket/*", 
        StatementId: "ID-1"
      }, coallback) 
        callback()
      },
      function _addLambdaPermission(callback) {
        console.log('add lambda perm')
        callback()
      }
      */
    ],
    function _done(err) {
      if (err) {
        console.log(err)
      }
      callback()
    })
  }
