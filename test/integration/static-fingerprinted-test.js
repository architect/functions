let { execSync: exec } = require('child_process')
let { copyFileSync, existsSync: exists, mkdirSync: mkdir } = require('fs')
let { join } = require('path')
let test = require('tape')

let arc
let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')

let origCwd = process.cwd()
let static

test('Set up mocked arc', t => {
  t.plan(2)
  process.env.AWS_REGION = 'us-west-1'
  mkdir(shared, { recursive: true })
  copyFileSync(join(mock, 'mock-arc-fingerprint'), join(shared, '.arc'))
  copyFileSync(join(mock, 'mock-arc-fingerprint'), join(tmp, '.arc'))
  t.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  t.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  process.chdir(tmp)

  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('Fingerprinting only enabled if static manifest is found', t => {
  t.plan(1)
  arc.static('index.html', { reload: true })
  t.equals(arc.static('index.html'), `/_static/index.html`)
})

test('Set up mocked static manifest', t => {
  t.plan(2)
  copyFileSync(join(mock, 'mock-static'), join(shared, 'static.json'))
  t.ok(exists(join(shared, 'static.json')), 'Mock static.json file ready')

  static = require(join(shared, 'static.json'))
  t.ok(static['index.html'], 'Static manifest loaded')
})

test('Clean up env', t => {
  t.plan(1)
  delete process.env.ARC_ENV
  delete process.env.AWS_REGION
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
