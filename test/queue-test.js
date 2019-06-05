let fs = require('fs')
let path = require('path')
let test = require('tape')
let waterfall = require('run-waterfall')
let parse = require('@architect/parser')
let queues = require('../src/queues')
let mockSnsEvent = require('./mock-sqs-event.json')

test('env', t=> {
  t.plan(3)
  t.ok(queues, 'gotta queues')
  t.ok(queues.subscribe, 'queues.subscribe')
  t.ok(queues.publish, 'queues.publish')
})

test('queues.subscribe', t=> {
  t.plan(1)
  
  // create a let to see if we successfully invoked
  let eventHandlerCalled = false

  // create a mock event handler
  function eventHandler(payload, callback) {
    console.log({payload})
    eventHandlerCalled = true
    callback()
  }

  // get a lambda signature from the handler
  let handler = queues.subscribe(eventHandler)

  // invoke the lambda handler with mock payloads
  let mockContext = {}
  handler(mockSnsEvent, mockContext, function _handler(err) {
    if (err) {
      t.fail(err) 
    }
    else {
      t.ok(eventHandlerCalled, 'successfully called') 
    }
  })
})
