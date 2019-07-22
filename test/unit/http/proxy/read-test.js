let test = require('tape')
let sinon = require('sinon')
// will need aws-sdk-mock to test out the rest of the read module
// let AWS = require('aws-sdk-mock')
// we need to reset the node_env for each test, to test different behaviour, and
// the node_env gets inspected at the top/global level of the module, therefore
// we set noPreserveCache and load the read module within each test.
let proxyquire = require('proxyquire').noPreserveCache();
const NODE_ENV = process.env.NODE_ENV

test('arc.proxy.read should invoke local sandbox when in testing mode', async t => {
  process.env.NODE_ENV = 'testing'
  let sandboxStub = sinon.stub().resolves(true)
  let read = proxyquire('../../../../src/http/proxy/read', {
    './sandbox': sandboxStub
  })
  t.plan(1)
  let params = { Key: 'index.html', config: {short:true} }
  await read(params)
  t.ok(sandboxStub.calledWith(params), 'sandbox function called with expected parameters')
  process.env.NODE_ENV = NODE_ENV
})
