var test = require('tape')
var dynalite = require('dynalite')
var session = require('../src/http/session')
var arc = require('../')
var cookie = require('cookie')

test('env', t=> {
  t.plan(1)
  t.ok(arc, 'gotta arc')
})

test('arc only accepts functions', t=> {
  t.plan(1)
  try {
    var handler = arc({})
  }
  catch(e) {
    t.ok(e, 'failed as expected')
    console.log(e)
  }
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

test('arc accepts middleware function and responds with html', t=> {
  t.plan(4)
  // sestup some mock middleware
  var firstCalled = false
  var secondCalled = false
  var thirdCalled = false

  function first(req, res, next) {
    console.log('request', req)
    firstCalled = true
    next()
  }

  function second(req, res, next) {
    secondCalled = true 
    next()
  }

  function third(req, res, next) {
    thirdCalled = true
    res({
      html: `<b>hello world</b>`
    })
  }

  // create a lambda handler
  var handler = arc.html.get(first, second, third)

  // execute the hander w mock data
  var request = {headers: {Cookie:''}, method:'get'}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(response, 'gotta result')
      t.ok(firstCalled, 'first called')
      t.ok(secondCalled, 'second called')
      t.ok(thirdCalled, 'third called')
      console.log('response', response)
    }
  })
})

test('arc responds with location', t=> {
  t.plan(2)

  // create a lambda handler
  var locCalled = false
  var handler = arc.html.get(function loc(req, res, next) {
    locCalled = true
    res({
      location: `/elsewhere`
    })
  })

  // execute the hander w mock data
  var request = {headers: {}, method:'get'}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.ok(err, err)
      t.ok(locCalled, 'loc called')
    }
    else {
      t.fail('loc must use errors')
    }
    console.log('response', response)
  })
})

var _idx
test('arc can save some data in a session', t=> {
  t.plan(2)

  // create a lambda handler
  var locCalled = false
  var handler = arc.html.get(function loc(req, res, next) {
    locCalled = true
    res({
      html: `<b>hi</b>`,
      session: {
        msg: 'hello world'
      }
    })
  })

  // execute the hander w mock data
  var request = {headers:{}, method:'get'}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err)
      console.log(err)
    }
    else {
      t.ok(response, 'gotta result')
      t.ok(locCalled, 'loc called')
      console.log('response', response)
      _idx = cookie.parse(response.cookie)._idx
      console.log(_idx)
    }
  })
})

var csrfToken
test('arc session can be retrieved', t=> {
  t.plan(3)

  // create a lambda handler
  var locCalled = false
  var handler = arc.html.get(function loc(req, res, next) {
    console.log(req)
    locCalled = true
    csrfToken = req.csrf
    t.ok(request.session.msg === 'hello world', 'session found')
    res({
      html: `sutr0 says hello`
    })
  })

  // execute the hander w mock data
  var request = {method:'get', headers: {Cookie:'_idx=' + _idx}}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err)
    }
    else {
      t.ok(response, 'gotta result')
      t.ok(locCalled, 'loc called')
      console.log('response', response)
    }
  })
})

test('crsf middleware with invalid post', t=> {
  t.plan(1)
  // create a lambda handler
  var handler = arc.html.post(arc.html.csrf, function loc(req, res, next) {
    res({
      html: `not called`
    })
  })
  // execute the hander w mock data
  var request = {method:'post', headers: {Cookie:'_idx=' + _idx}}
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.ok(JSON.parse(err).statusCode === 403, 'failed w 403')
      console.log(err)
    }
    else {
      t.fail(response, 'gotta result')
    }
  })
})

test('crsf middleware with valid post', t=> {
  t.plan(2)
  // create a lambda handler
  var handler = arc.html.post(arc.html.csrf, function loc(req, res, next) {
    t.ok(true, 'csrf middlware handler invoked')
    res({
      html: `called!`
    })
  })
  // execute the hander w mock data
  var request = {
    method: 'post', 
    headers: {
      Cookie:'_idx=' + _idx
    }, 
    body: {
      csrf: csrfToken
    }
  }
  var context = {}
  handler(request, context, function errback(err, response) {
    if (err) {
      t.fail(err, 'csrf request was invalid')
      console.log(err)
    }
    else {
      t.ok(response, 'request was valid')
      console.log(response)
    }
  })
})

/*
test('response err types', t=> {
  t.plan(2)
  // create a lambda handler
  var handler = arc.html.get(function loc(req, res, next) {
    t.ok(true, 'handler invoked')
    res(Error('testerr'))
  })
  // execute the hander w mock data
  handler({
    method: 'get', 
    headers: {},
  }, {}, function errback(err, response) {
    if (err) {
      t.ok(err, err)
      console.log(err)
    }
    else {
      t.fail(response, 'request was valid')
      console.log(response)
    }
  })
})

test('response bad res obj', t=> {
  t.plan(2)
  // create a lambda handler
  var handler = arc.html.get(function loc(req, res, next) {
    t.ok(true, 'handler invoked')
    res('')
  })
  // execute the hander w mock data
  handler({
    method: 'get', 
    headers: {},
  }, {}, function errback(err, response) {
    if (err) {
      t.ok(err, err)
      console.log(err)
    }
    else {
      t.fail(response, 'request was valid')
      console.log(response)
    }
  })
})

test('response bad location', t=> {
  t.plan(2)
  // create a lambda handler
  var handler = arc.json.get(function loc(req, res, next) {
    t.ok(true, 'handler invoked')
    res({location:'asdf'})
  })
  // execute the hander w mock data
  handler({
    method: 'get', 
    headers: {},
  }, {}, function errback(err, response) {
    if (err) {
      t.ok(err, err)
      console.log(err)
    }
    else {
      t.fail(response, 'request was valid')
      console.log(response)
    }
  })
})

test('uncaught throw renders response', t=> {
  t.plan(2)
  // create a lambda handler
  var handler = arc.json.get(function loc(req, res, next) {
    t.ok(true, 'handler invoked')
    throw Error('wtf')
    res({location:'asdf'})
  })

  // execute the hander w mock data
  handler({
    method: 'get', 
    headers: {},
  }, {}, function errback(err, response) {
    if (err) {
      t.ok(err, err)
      console.log(err)
    }
    else {
      t.fail(response, 'request was valid')
      console.log(response)
    }
  })
})

test('unhandled rejection renders response', t=>{
  t.plan(2)
  // create a lambda handler
  var handler = arc.json.get(function loc(req, res, next) {
    t.ok(true, 'handler invoked')
    new Promise((resolve, reject)=> {
      reject(Error('omg'))
    }).then(function() {
      res({json:{}}) 
    })
  })

  // execute the hander w mock data
  handler({
    method: 'get', 
    headers: {},
  }, {}, function errback(err, response) {
    if (err) {
      t.ok(err, err)
      console.log(err)
    }
    else {
      t.fail(response, 'request was valid')
      console.log(response)
    }
  })
})
*/
test('can shutdown', t=> {
  t.plan(1)
  server.close()
  t.ok(true, 'server closed')
})
