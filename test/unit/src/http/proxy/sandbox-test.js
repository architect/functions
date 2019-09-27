let test = require('tape')
let sandbox = require('../../../../../src/http/proxy/sandbox')
let fs = require('fs')
let join = require('path').join

let basicRead = {
  Key: 'this-is-fine.gif',
  isProxy: false,
  config: {spa: true}
}
let path = join(process.cwd(), 'test', 'mock', 'project', 'public')

test('Set up env', t => {
  t.plan(1)
  t.ok(sandbox, 'Loaded sandbox')
})

test('Basic file reads', async t => {
  t.plan(3)
  process.env.ARC_SANDBOX_PATH_TO_STATIC = path
  // TODO test without path_to_static (legacy mode?)

  // File not found
  let _basicRead = JSON.parse(JSON.stringify(basicRead))
  let result = await sandbox(_basicRead)
  t.ok(result.body.includes('NoSuchKey'), 'Nonexistent file produces missing file error')
  t.equal(result.statusCode, 404, 'File not found returns 404')

  // File found
  _basicRead = JSON.parse(JSON.stringify(basicRead))
  let filename = 'publicfile.md'
  _basicRead.Key = filename
  let publicfile = fs.readFileSync(join(path, filename)).toString()
  result = await sandbox(_basicRead)
  t.equal(Buffer.from(result.body, 'base64').toString(), publicfile, 'File contents match disk')
})

test('File read with ARC_STATIC_FOLDER set', async t => {
  t.plan(2)
  // Local reads should remain the same with ARC_STATIC_FOLDER, which is intended for remote/S3 use only
  process.env.ARC_STATIC_FOLDER = 'foobar'
  t.ok(process.env.ARC_STATIC_FOLDER, 'ARC_STATIC_FOLDER set')
  let _basicRead = JSON.parse(JSON.stringify(basicRead))
  let filename = 'publicfile.md'
  _basicRead.Key = filename
  let publicfile = fs.readFileSync(join(path, filename)).toString()
  let result = await sandbox(_basicRead)
  t.equal(Buffer.from(result.body, 'base64').toString(), publicfile, 'File contents match disk')
  delete process.env.ARC_SANDBOX_PATH_TO_STATIC
  delete process.env.ARC_STATIC_FOLDER
})
