let { execSync: exec } = require('child_process')
let { copyFileSync, existsSync: exists, mkdirSync: mkdir } = require('fs')
let { join } = require('path')
const { test } = require('node:test')
const assert = require('node:assert')

let arc
let mock = join(__dirname, '..', 'mock')
let tmp = join(mock, 'tmp')
let shared = join(tmp, 'node_modules', '@architect', 'shared')

let origCwd = process.cwd()
let static

test('Set up mocked arc', () => {
  process.env.AWS_REGION = 'us-west-1'
  mkdir(shared, { recursive: true })
  copyFileSync(join(mock, 'mock-arc-fingerprint'), join(shared, '.arc'))
  copyFileSync(join(mock, 'mock-arc-fingerprint'), join(tmp, '.arc'))
  assert.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  assert.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  process.chdir(tmp)

  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('Fingerprinting only enabled if static manifest is found', () => {
  arc.static('index.html', { reload: true })
  assert.strictEqual(arc.static('index.html'), `/_static/index.html`)
})

test('Set up mocked static manifest', () => {
  copyFileSync(join(mock, 'mock-static'), join(shared, 'static.json'))
  assert.ok(exists(join(shared, 'static.json')), 'Mock static.json file ready')

  static = require(join(shared, 'static.json'))
  assert.ok(static['index.html'], 'Static manifest loaded')
})

test('Clean up env', () => {
  delete process.env.ARC_ENV
  delete process.env.AWS_REGION
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  assert.ok(!exists(tmp), 'Mocks cleaned up')
})
