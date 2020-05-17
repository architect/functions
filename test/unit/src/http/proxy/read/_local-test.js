let test = require('tape')
let readLocal = require('../../../../../../src/http/proxy/read/_local')
let fs = require('fs')
let join = require('path').join

let staticStub = {
  'images/this-is-fine.gif': 'images/this-is-fine-a1c3e5.gif',
  'publicfile.md': 'publicfile-b2d4f6.md'
}
let basicRead = {
  Key: 'images/this-is-fine.gif',
  isProxy: true,
  config: {spa: true}
}
let dec = i => Buffer.from(i, 'base64').toString()
let path = join(process.cwd(), 'test', 'mock', 'project', 'public')

test('Set up env', t => {
  t.plan(1)
  t.ok(readLocal, 'Loaded readLocal')
})

test('Basic file reads', async t => {
  t.plan(3)
  process.env.ARC_SANDBOX_PATH_TO_STATIC = path
  // TODO test without path_to_static (legacy mode?)

  // File not found
  let _basicRead = JSON.parse(JSON.stringify(basicRead))
  let result = await readLocal(_basicRead)
  t.ok(result.body.includes('NoSuchKey'), 'Nonexistent file produces missing file error')
  t.equal(result.statusCode, 404, 'File not found returns 404')

  // File found
  _basicRead = JSON.parse(JSON.stringify(basicRead))
  let filename = 'publicfile.md'
  _basicRead.Key = filename
  let publicfile = fs.readFileSync(join(path, filename)).toString()
  result = await readLocal(_basicRead)
  t.equal(dec(result.body), publicfile, 'File contents match disk')
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
  let result = await readLocal(_basicRead)
  t.equal(dec(result.body), publicfile, 'File contents match disk')
  delete process.env.ARC_STATIC_FOLDER

})

test('File parsed with local paths when fingerprinting is enabled', async t => {
  t.plan(3)
  // Local reads should remain the same with ARC_STATIC_FOLDER, which is intended for remote/S3 use only
  let _basicRead = JSON.parse(JSON.stringify(basicRead))
  let filename = 'publicfile.md'
  let img = 'images/this-is-fine.gif'
  _basicRead.Key = filename
  _basicRead.assets = staticStub
  let publicfile = fs.readFileSync(join(path, filename)).toString()
  let result = await readLocal(_basicRead)
  t.notEqual(dec(result.body), publicfile, `Contents containing template calls mutated: ${dec(result.body)}`)
  t.ok(dec(result.body).includes(img), `Used non-fingerprinted filename in sandbox mode: ${img}`)
  t.notOk(dec(result.body).includes(staticStub[img]), `Did not use fingerprinted filename in sandbox mode: ${staticStub[img]}`)
  delete process.env.ARC_SANDBOX_PATH_TO_STATIC
  delete process.env.ARC_STATIC_FOLDER
  t.end()
})
