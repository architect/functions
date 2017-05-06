var parallel = require('run-parallel')
var path = require('path')
var mkdir = require('mkdirp').sync
var rm = require('rimraf').sync
var cp = require('cp').sync
var fs = require('fs')
var test = require('tape')
var getIAM = require('../src/generators/_get-iam-role.js')
var generate = require('../src/generators')
var aws = require('aws-sdk')
var sns = new aws.SNS

test('_get-iam-role does', t=> {
  t.plan(1)
  getIAM(function _iam(err, role) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(role, 'got role')
      console.log(role)
    }
  })
})

test('env', t=> {
  t.plan(1)
  t.ok(generate, 'generate exists')
})

test('mock-arc parses', t=> { 
  t.plan(1)
  generate({
    arcFile: path.join(__dirname, 'mock-arc'), 
    execute: false
  }, 
  function _generate(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'mock-arc parses')
    }
  })
})

test('create a dummy dir to work from', t=> {
  t.plan(1)
  mkdir('_mock')
  var mock = path.join(__dirname, 'mock-arc')
  cp(mock, path.join('_mock', '.arc'))
  process.chdir('_mock')
  var parts = process.cwd().split(path.sep)
  var last = parts[parts.length - 1]
  t.equal(last, '_mock', 'in _mock')
})

test('mock-arc executes', t=> {
  t.plan(1)
  generate({
    arcFile: path.join(process.cwd(), '.arc'), 
    execute: true
  }, 
  function _generate(err) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(true, 'mock-arc executes')
    }
  })
})
/*
test('cleanup _mock', t=> {
  t.plan(1)
  process.chdir('..')
  rm('_mock')
  t.ok(fs.existsSync(path.join(process.cwd(), '_mock')) === false, 'cleaned up')
})


test('nuke topics', t=> {
  t.plan(2)
  // hardcode to remove sns topics generated from test/mock-arc
  var staging = 'test-app-name-staging-some-test-event'
  var production = 'test-app-name-production-some-test-event'
 
  sns.listTopics({}, function(err, data) {
    if (err) {
      console.log(err, err.stack)
      t.fail(err)
    }
    else {    
      t.ok(data, 'got topics')
      var arns = []
      data.Topics.forEach(t=> {
        var parts = t.TopicArn.split(':')
        var last = parts[parts.length - 1]      
        if ([staging, production].includes(last)) {
          arns.push(t.TopicArn)
        }
      })
      var fns = arns.map(arn=> {
        return function _delTopic(callback) {
          sns.deleteTopic({TopicArn:arn}, callback)
        }
      })
      parallel(fns, function _done(err) {
        if (err) {
          t.fail(err)
        }
        else {
          t.ok(true, 'deleted topics')
          console.log(arns)
        }
      })
    }
  })
})*/

test('nuke lambdas')

