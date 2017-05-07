var waterfall = require('run-waterfall')
var zip = require('zipit')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var getIAM = require('../_get-iam-role')

//
// name: arc-sessions-insert
// env: appname-staging-arc-sessions-insert
//
module.exports = function _createLambda(name, env, callback) {
  var Description = `@table ${env}`
  waterfall([
    // gets the IAM role for lambda execution
    function _getRole(callback) {
      getIAM(callback)
    },
    function _readCode(role, callback) {
      zip({
        input: [
          `src/tables/${name}/index.js`,
          `src/tables/${name}/package.json`,
          `src/tables/${name}/node_modules`
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
        Description,
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
    function _addApiGatewayInvokePermission(topicArn, callback) {
      lambda.addPermission({
        FunctionName: env,
        Action: "lambda:InvokeFunction",
        Principal: "apigateway.amazonaws.com",
        StatementId: "idx-1" + Date.now(),
        SourceArn: topicArn,
      },
      function _addPermission(err) {
        if (err) {
          console.log(err)
        }
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
