let test = require('tape')
let arc = require('../../../../../src')

// Ensure compatibility with legacy proxy methods
test('Primary proxy method', t => {
  t.plan(6)
  // Current
  let httpProxy = arc.http.proxy
  t.equal(typeof httpProxy, 'function', 'arc.http.proxy is a function')
  t.equal(httpProxy.name, 'proxy', 'arc.http.proxy is the proxy function')

  // Legacy
  let httpProxyPublic = arc.http.proxy.public
  t.equal(typeof httpProxyPublic, 'function', 'arc.http.proxy.public is a function')
  t.equal(httpProxyPublic.name, 'proxy', 'arc.http.proxy.public is the proxy function')

  // Like, really legacy
  let proxyPublic = arc.proxy.public
  t.equal(typeof proxyPublic, 'function', 'arc.proxy.public is a function')
  t.equal(proxyPublic.name, 'proxy', 'arc.proxy.public is the proxy function')
})

test('Secondary proxy.read method (local)', t => {
  t.plan(6)
  let env = process.env.NODE_ENV
  process.env.NODE_ENV = 'testing'

  // Current
  let httpProxyRead = arc.http.proxy.read
  t.equal(typeof httpProxyRead, 'function', 'arc.http.proxy.read is a function')
  t.equal(httpProxyRead.name, 'readLocal', 'arc.http.proxy.read is the readLocal function')

  // Legacy
  let httpProxyPublicRead = arc.http.proxy.public.read
  t.equal(typeof httpProxyPublicRead, 'function', 'arc.http.proxy.public.read is a function')
  t.equal(httpProxyPublicRead.name, 'readLocal', 'arc.http.proxy.public.read is the readLocal function')

  // Like, really legacy
  let proxyPublicRead = arc.proxy.public.read
  t.equal(typeof proxyPublicRead, 'function', 'arc.proxy.public.read is a function')
  t.equal(proxyPublicRead.name, 'readLocal', 'arc.proxy.public.read is the readLocal function')

  process.env.NODE_ENV = env
})

test('Secondary proxy.read method (AWS)', t => {
  t.plan(2)
  // Just check to make sure switching to S3 works
  // Legacy signatures will by default work if above tests pass

  let env = process.env.NODE_ENV
  process.env.NODE_ENV = 'staging'

  let read = '../../../../../src/http/proxy/read'
  delete require.cache[require.resolve(read)]
  // eslint-disable-next-line
  let httpProxyRead = require(read)

  t.equal(typeof httpProxyRead, 'function', 'arc.http.proxy.read is a function')
  t.equal(httpProxyRead.name, 'readS3', 'arc.http.proxy.read is the readS3 function')

  process.env.NODE_ENV = env
  delete require.cache[require.resolve(read)]
  // eslint-disable-next-line
  require(read)
})
