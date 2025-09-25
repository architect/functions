const { execSync: exec } = require('node:child_process')
const { copyFileSync, existsSync: exists, mkdirSync: mkdir } = require('node:fs')
const { join } = require('node:path')
const test = require('tape')

let arc
const mock = join(__dirname, '..', 'mock')
const tmp = join(mock, 'tmp')
const shared = join(tmp, 'node_modules', '@architect', 'shared')

const origCwd = process.cwd()
let staticManifest

test('Set up mocked arc', (t) => {
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

test('Fingerprinting only enabled if static manifest is found', (t) => {
  t.plan(1)
  arc.static('index.html', { reload: true })
  t.equals(arc.static('index.html'), '/_static/index.html')
})

test('Set up mocked static manifest', (t) => {
  t.plan(2)
  copyFileSync(join(mock, 'mock-static'), join(shared, 'static.json'))
  t.ok(exists(join(shared, 'static.json')), 'Mock static.json file ready')

  staticManifest = require(join(shared, 'static.json'))
  t.ok(staticManifest['index.html'], 'Static manifest loaded')
})

test('Clean up env', (t) => {
  t.plan(1)
  delete process.env.ARC_ENV
  delete process.env.AWS_REGION
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
