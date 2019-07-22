let test = require('tape')
let sinon = require('sinon')
let fs = require('fs')
// we need to reset the node_env for each test, to test different behaviour, and
// the node_env gets inspected at the top/global level of the module, therefore
// we set noPreserveCache and load the read module within each test.
let proxyquire = require('proxyquire').noPreserveCache();
const NODE_ENV = process.env.NODE_ENV
let readFake = sinon.stub(fs, 'readFile').yields(null, 'this is file body')

test.skip('arc.proxy.read should read from local public folder (via the transform module) when in testing mode', async t => {
  process.env.NODE_ENV = 'testing'
  let transformStub = sinon.stub().returns(true)
  let read = proxyquire('../../../../src/http/proxy/read', {
    './transform': transformStub
  })
  t.plan(1)
  let existsFake = sinon.stub(fs, 'existsSync').returns(true)
  await read({ Key: 'index.html' })
  t.ok(transformStub.calledOnce, 'transform function called')
  readFake.restore()
  existsFake.restore()
  process.env.NODE_ENV = NODE_ENV
})
