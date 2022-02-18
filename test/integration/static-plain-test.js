let { execSync: exec } = require('child_process')
let { copyFileSync, existsSync: exists, mkdirSync: mkdir } = require('fs')
let { join } = require('path')
let test = require('tape')

let arc
let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')

let origCwd = process.cwd()

let resetEnv = () => {
  delete process.env.ARC_ENV
}

test('Set up mocked files', t => {
  t.plan(2)
  process.env.ARC_ENV = 'testing'
  process.env.ARC_SANDBOX = JSON.stringify({ ports: {}, version: '5.0.0' })
  mkdir(shared, { recursive: true })
  copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  t.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  t.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  process.chdir(tmp)
  // eslint-disable-next-line
  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('Local URL tests', t => {
  t.plan(6)
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path')
  t.equal(arc.static('/index.html'), '/_static/index.html', 'Basic local static path with leading slash')

  process.env.ARC_ENV = 'testing'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path (env=testing)')

  process.env.ARC_ENV = 'staging'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Always use /_static')

  delete process.env.ARC_ENV // Run it "locally"
  process.env.ARC_STATIC_PREFIX = 'foo'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path unaffected by ARC_STATIC_PREFIX env var')
  delete process.env.ARC_STATIC_PREFIX

  process.env.ARC_STATIC_FOLDER = 'foo'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path unaffected by ARC_STATIC_FOLDER env var')
  resetEnv()
})

test('Clean up env', t => {
  t.plan(1)
  delete process.env.ARC_ENV
  delete process.env.ARC_SANDBOX
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
