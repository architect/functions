var parallel = require('run-parallel')
var waterfall = require('run-waterfall')
var assert = require('@smallwins/validate/assert')
var zip = require('zipit')
var aws = require('aws-sdk')
var lambda = new aws.Lambda
var getIAM = require('./_get-iam-role')
var print = require('./_print')

module.exports = function _createDeployments(params, callback) {

  assert(params, {
    app: String,
    route: Array,
  })

  var mthd = params.route[0].toLowerCase()
  var pth = params.route[1] === '/'? '-index' : params.route[1].replace(/\//g, '-').replace(':', '000')
  var name = `${mthd}${pth}`

  function _create(stage, callback) {
    lambda.getFunction({FunctionName:stage}, function _gotFn(err) {
      if (err && err.name === 'ResourceNotFoundException') {
        console.log('create: ' + stage)
        _createLambda(name, stage, params.route, callback)
      }
      else if (err) {
        console.log(err)
        callback(err)
      }
      else {
        // noop if it exists
        //console.log(`skip: ${stage} exists`)
        print.skip('@json', stage)
        callback()
      }
    })
  }

  var staging = _create.bind({}, `${params.app}-staging-${name}`)
  var production = _create.bind({}, `${params.app}-production-${name}`)

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

function _createLambda(name, env, route, callback) {
  var Description = `@json ${route.join(' ')}`
  waterfall([
    // gets the IAM role for lambda execution
    function _getRole(callback) {
      getIAM(callback)
    },
    function _readCode(role, callback) {
      zip({
        input: [
          `src/json/${name}/index.js`,
          `src/json/${name}/package.json`,
          `src/json/${name}/node_modules`
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
