var fs = require('fs')
var path = require('path')
var parse = require('@smallwins/arc-parser')
var test = require('tape')
var events = require('../src/events')
var mockSnsEvent = require('./mock-sns-event.json')
var getIAM = require('../src/_get-iam-role.js')

test('env', t=> {
  t.plan(2)
  t.ok(events, 'gotta events')
  t.ok(events.subscribe, 'events.subscribe')
})

test('events.subscribe', t=> {
  t.plan(1)
  
  // create a var to see if we successfully invoked
  var eventHandlerCalled = false

  // create a mock event handler
  function eventHandler(payload, callback) {
    console.log({payload})
    eventHandlerCalled = true
    callback()
  }

  // get a lambda signature from the handler
  var handler = events.subscribe(eventHandler)

  // invoke the lambda handler with mock payloads
  var mockContext = {}
  handler(mockSnsEvent, mockContext, function _handler(err, result) {
    if (err) {
      t.fail(err) 
    }
    else {
      t.ok(eventHandlerCalled, 'successfully called') 
    }
  })
})

test('events.generate.plan', t=> {
  t.plan(1)
  var arcPath = path.join(__dirname, 'mock-arc')
  var mockArc = fs.readFileSync(arcPath).toString()
  var parsed = parse(mockArc)
  events.generate.plan(parsed, function _plan(err, result) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(result, 'got a result')
      console.log(result)
    }
  })
})

test.only('get iam', t=> {
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
/*
test('events.generate.exec', t=> {

})

test('events.publish', t=> {
  t.plan(1)
  events.publish('test-event', function _publish(err, result) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(result, 'gotta result')
      console.log(result)
    }
  })
})

test('manually cleanup', t=> {
  t.plan(1)
})*/
