let exec = require('child_process').execSync
let exists = require('path-exists').sync
let fs = require('fs')
let join = require('path').join
let mkdir = require('mkdirp').sync
let test = require('tape')

let arc
let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')

let origRegion = process.env.AWS_REGION
let origCwd = process.cwd()

let resetEnv = () => {
  delete process.env.AWS_REGION
  delete process.env.NODE_ENV
  delete process.env.ARC_STATIC_PREFIX
  delete process.env.ARC_STATIC_FOLDER
  delete process.env.ARC_STATIC_BUCKET
}

test('Set up mocked files', t => {
  t.plan(2)
  mkdir(shared)
  fs.copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  fs.copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  t.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  t.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  process.chdir(tmp)
  // eslint-disable-next-line
  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('Local URL tests', t => {
  t.plan(7)
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path')
  t.equal(arc.static('/index.html'), '/_static/index.html', 'Basic local static path with leading slash')
  t.equal(arc.http.helpers.static('index.html'), '/_static/index.html', 'Basic local static path (legacy)')

  process.env.NODE_ENV = 'testing'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path (env=testing)')

  process.env.NODE_ENV = 'staging'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Always use /_static')

  delete process.env.NODE_ENV // Run it "locally"
  process.env.ARC_STATIC_PREFIX = 'foo'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path unaffected by ARC_STATIC_PREFIX env var')
  delete process.env.ARC_STATIC_PREFIX

  process.env.ARC_STATIC_FOLDER = 'foo'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path unaffected by ARC_STATIC_FOLDER env var')
  resetEnv()
})

test('Clean up env', t => {
  t.plan(1)
  process.env.AWS_REGION = origRegion
  process.env.NODE_ENV = 'testing'
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
