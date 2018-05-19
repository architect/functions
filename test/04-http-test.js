var test = require('tape')
var dynalite = require('dynalite')
var session = require('../src/http/session')
var arc = require('../')
var cookie = require('cookie')

test('env', t=> {
  t.plan(1)
  t.ok(arc, 'gotta arc')
})

var server
test('can startup dynalite server', t=> {
  t.plan(1)
  server = dynalite({createTableMs:0}).listen(5000, err=> {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'Dynalite started on port 5000')
    }
  })
})

test('can init', t=> {
  t.plan(1)
  session.init('arc-sessions', function _init(err) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(true, 'initialized')
    }
  })
})

// test css: 
// test statuscodes
// test js, text, xml

test('res({css})', t=> {
  t.plan(1)
  // create a lambda handler
  var handler = arc.css.get(function first(req, res, next) {
    console.log('request', req)
    res({css:'body:{background:blue;}'})
  })
  // execute the hander w mock data
  var request = {headers: {Cookie:''}, method:'get'}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(response, 'gotta result')
      console.log('response', response)
    }
  })
})

test('res({js})', t=> {
  t.plan(1)
  // create a lambda handler
  var handler = arc.js.get(function first(req, res, next) {
    console.log('request', req)
    res({js:'console.log("hi")'})
  })
  // execute the hander w mock data
  var request = {headers: {Cookie:''}, method:'get'}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(response, 'gotta result')
      console.log('response', response)
    }
  })
})

test('res({text})', t=> {
  t.plan(1)
  // create a lambda handler
  var handler = arc.text.get(function first(req, res, next) {
    console.log('request', req)
    res({text:'plain text'})
  })
  // execute the hander w mock data
  var request = {headers: {Cookie:''}, method:'get'}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(response, 'gotta result')
      console.log('response', response)
    }
  })
})

test('res({xml})', t=> {
  t.plan(1)
  // create a lambda handler
  var handler = arc.xml.get(function first(req, res, next) {
    console.log('request', req)
    res({xml:'<foo>bar</foo>'})
  })
  // execute the hander w mock data
  var request = {headers: {Cookie:''}, method:'get'}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(response, 'gotta result')
      console.log('response', response)
    }
  })
})

test('can shutdown', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'server closed')
})
