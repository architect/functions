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
  delete process.env.ARC_STATIC_FOLDER
  delete process.env.ARC_STATIC_BUCKET
}

test('Set up mocked files', t=> {
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

test('Local URL tests', t=> {
  t.plan(6)
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path')
  t.equal(arc.static('/index.html'), '/_static/index.html', 'Basic local static path with leading slash')
  t.equal(arc.http.helpers.static('index.html'), '/_static/index.html', 'Basic local static path (legacy)')

  process.env.NODE_ENV = 'testing'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path (env=testing)')

  process.env.NODE_ENV = 'staging'
  t.notEqual(arc.static('index.html'), '/_static/index.html', 'Basic local static path not used in staging')

  delete process.env.NODE_ENV // Run it "locally"
  process.env.ARC_STATIC_FOLDER = 'foo'
  t.equal(arc.static('index.html'), '/_static/index.html', 'Basic local static path unaffected by ARC_STATIC_FOLDER env var')
  resetEnv()
})

test('Staging and production URL tests (fingerprint disabled by lack of @architect/shared/static.json)', t=> {
  t.plan(5)
  process.env.AWS_REGION = 'us-west-1'
  process.env.NODE_ENV = 'production'
  t.equals(arc.static('index.html'), 'https://a-production-bucket.s3.us-west-1.amazonaws.com/index.html', 'Production URL matches')
  t.equals(arc.http.helpers.static('index.html'), 'https://a-production-bucket.s3.us-west-1.amazonaws.com/index.html', 'Production URL matches (legacy)')

  process.env.NODE_ENV = 'staging'
  t.equals(arc.static('index.html'), 'https://a-staging-bucket.s3.us-west-1.amazonaws.com/index.html', 'Staging URL matches')

  process.env.ARC_STATIC_BUCKET = 'a-totally-different-bucket'
  t.equals(arc.static('index.html'), 'https://a-totally-different-bucket.s3.us-west-1.amazonaws.com/index.html', 'ARC_STATIC_BUCKET env var populates and matches')

  process.env.ARC_STATIC_FOLDER = 'a-folder'
  t.equals(arc.static('index.html'), 'https://a-totally-different-bucket.s3.us-west-1.amazonaws.com/a-folder/index.html', 'ARC_STATIC_FOLDER env var populates and matches')
  resetEnv()
})

test('Staging and production URL tests (fingerprint inferred by @architect/shared/static.json)', t=> {
  t.plan(6)
  process.env.AWS_REGION = 'us-west-1'
  process.env.NODE_ENV = 'production'
  fs.copyFileSync(join(mock, 'mock-static'), join(shared, 'static.json'))
  t.ok(exists(join(shared, 'static.json')), 'Mock static.json file ready')
  t.equals(arc.static('index.html'), 'https://a-production-bucket.s3.us-west-1.amazonaws.com/index-1e25d663f6.html', 'Production URL matches')
  t.equals(arc.http.helpers.static('index.html'), 'https://a-production-bucket.s3.us-west-1.amazonaws.com/index-1e25d663f6.html', 'Production URL matches (legacy)')

  process.env.NODE_ENV = 'staging'
  t.equals(arc.static('index.html'), 'https://a-staging-bucket.s3.us-west-1.amazonaws.com/index-1e25d663f6.html', 'Staging URL matches')

  process.env.ARC_STATIC_BUCKET = 'a-totally-different-bucket'
  t.equals(arc.static('index.html'), 'https://a-totally-different-bucket.s3.us-west-1.amazonaws.com/index-1e25d663f6.html', 'ARC_STATIC_BUCKET env var populates and matches')

  process.env.ARC_STATIC_FOLDER = 'a-folder'
  t.equals(arc.static('index.html'), 'https://a-totally-different-bucket.s3.us-west-1.amazonaws.com/a-folder/index-1e25d663f6.html', 'ARC_STATIC_FOLDER env var populates and matches')
  resetEnv()
})

test('Clean up env', t=> {
  t.plan(1)
  process.env.AWS_REGION = origRegion
  process.env.NODE_ENV = 'testing'
  process.chdir(origCwd)
  exec(`rm -rf ${tmp}`)
  t.ok(!exists(tmp), 'Mocks cleaned up')
})
