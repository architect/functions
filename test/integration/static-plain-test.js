const { execSync: exec } = require('node:child_process')
const { copyFileSync, existsSync: exists, mkdirSync: mkdir } = require('node:fs')
const { join } = require('node:path')
const test = require('tape')

let arc
const mock = join(__dirname, '..', 'mock')
const tmp = join(mock, 'tmp')
const shared = join(tmp, 'node_modules', '@architect', 'shared')

const origCwd = process.cwd()

const resetEnv = () => {
  delete process.env.ARC_ENV
}

test('Set up mocked files', (t) => {
  t.plan(2)
  process.env.ARC_ENV = 'testing'
  mkdir(shared, { recursive: true })
  copyFileSync(join(mock, 'mock-arc'), join(shared, '.arc'))
  copyFileSync(join(mock, 'mock-arc'), join(tmp, '.arc'))
  t.ok(exists(join(shared, '.arc')), 'Mock .arc (shared) file ready')
  t.ok(exists(join(tmp, '.arc')), 'Mock .arc (root) file ready')
  process.chdir(tmp)

  arc = require('../..') // module globally inspects arc file so need to require after chdir
})

test('Local URL tests', (t) => {
  t.plan(6)
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path')
  t.equal(arc.static('/index.html'), '/_static/index.html', 'Basic local static path with leading slash')

  process.env.ARC_ENV = 'testing'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path (env=testing)')

  process.env.ARC_ENV = 'staging'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Always use /_static')

  delete process.env.ARC_ENV // Run it "locally"
  process.env.ARC_STATIC_PREFIX = 'foo'
  t.equal(
    arc.static('index.html'),
    '/_static/index.html',
    'Basic local static path unaffected by ARC_STATIC_PREFIX env var',
  )
  delete process.env.ARC_STATIC_PREFIX

  process.env.ARC_STATIC_FOLDER = 'foo'
  t.equal(
    arc.static('index.html'),
    '/_static/index.html',
    'Basic local static path unaffected by ARC_STATIC_FOLDER env var',
  )
  resetEnv()
})

test('Clean up env', (t) => {
  t.plan(1)
  delete process.env.ARC_ENV
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
