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

let resetEnv = () => {
  delete process.env.ARC_ENV
}

test('Set up mocked files', () => {
  process.env.ARC_ENV = 'testing'
  mkdir(shared, { recursive: true })
  copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  assert.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  assert.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  process.chdir(tmp)

  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('Local URL tests', () => {
  assert.strictEqual(arc.static('index.html'), '/_static/index.html', 'Basic local static path')
  assert.strictEqual(arc.static('/index.html'), '/_static/index.html', 'Basic local static path with leading slash')

  process.env.ARC_ENV = 'testing'
  assert.strictEqual(arc.static('index.html'), '/_static/index.html', 'Basic local static path (env=testing)')

  process.env.ARC_ENV = 'staging'
  assert.strictEqual(arc.static('index.html'), '/_static/index.html', 'Always use /_static')

  delete process.env.ARC_ENV // Run it "locally"
  process.env.ARC_STATIC_PREFIX = 'foo'
  assert.strictEqual(arc.static('index.html'), '/_static/index.html', 'Basic local static path unaffected by ARC_STATIC_PREFIX env var')
  delete process.env.ARC_STATIC_PREFIX

  process.env.ARC_STATIC_FOLDER = 'foo'
  assert.strictEqual(arc.static('index.html'), '/_static/index.html', 'Basic local static path unaffected by ARC_STATIC_FOLDER env var')
  resetEnv()
})

test('Clean up env', () => {
  delete process.env.ARC_ENV
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  assert.ok(!exists(tmp), 'Mocks cleaned up')
})
