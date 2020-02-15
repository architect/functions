let test = require('tape')
let arc = require('../../../../src')

// Ensure compatibility with legacy proxy methods
test('Primary proxy method', t => {
  t.plan(6)
  // Current
  let httpProxy = arc.http.proxy
  t.equal(typeof httpProxy, 'function', 'arc.http.proxy is a function')
  t.equal(httpProxy.name, 'proxyPublic', 'arc.http.proxy is the proxyPublic function')

  // Legacy
  let httpProxyPublic = arc.http.proxy.public
  t.equal(typeof httpProxyPublic, 'function', 'arc.http.proxy.public is a function')
  t.equal(httpProxyPublic.name, 'proxyPublic', 'arc.http.proxy.public is the proxyPublic function')

  // Like, really legacy
  let proxyPublic = arc.proxy.public
  t.equal(typeof proxyPublic, 'function', 'arc.proxy.public is a function')
  t.equal(proxyPublic.name, 'proxyPublic', 'arc.proxy.public is the proxyPublic function')
})

test('Secondary proxy.read method', t => {
  t.plan(6)
  // Current
  let httpProxyRead = arc.http.proxy.read
  t.equal(typeof httpProxyRead, 'function', 'arc.http.proxy.read is a function')
  t.equal(httpProxyRead.name, 'read', 'arc.http.proxy.read is the read function')

  // Legacy
  let httpProxyPublicRead = arc.http.proxy.public.read
  t.equal(typeof httpProxyPublicRead, 'function', 'arc.http.proxy.public.read is a function')
  t.equal(httpProxyPublicRead.name, 'read', 'arc.http.proxy.public.read is the read function')

  // Like, really legacy
  let proxyPublicRead = arc.proxy.public.read
  t.equal(typeof proxyPublicRead, 'function', 'arc.proxy.public.read is a function')
  t.equal(proxyPublicRead.name, 'read', 'arc.proxy.public.read is the read function')
})
