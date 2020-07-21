let test = require('tape')
let { join } = require('path')
let path = join(process.cwd(), 'src', 'http', 'proxy', 'format', 'compress')
let sut = require(path)

let {
  gzipSync,
  gunzipSync,
  brotliCompressSync,
  brotliDecompressSync,
  deflateSync,
  inflateSync,
} = require('zlib')

let data = 'this is fine'

test('Set up env', t => {
  t.plan(3)
  t.ok(sut, 'Loaded compression util')
  t.ok(sut.compress, 'Compression util has compress method')
  t.ok(sut.decompress, 'Compression util has decompress method')
})

test('Fails with wrong type', t => {
  t.plan(1)
  let { compress } = sut
  t.throws(() => {
    compress('zip', data)
  }, 'Errors on incorrect compression type')
})

test('Compression', t => {
  t.plan(3)
  let { compress } = sut
  let gzip = compress('gzip', data)
  let br = compress('br', data)
  let deflate = compress('deflate', data)
  t.equal(gunzipSync(gzip).toString(), data, 'gzip returned correct data')
  t.equal(brotliDecompressSync(br).toString(), data, 'br returned correct data')
  t.equal(inflateSync(deflate).toString(), data, 'deflate returned correct data')
})

test('Decompression', t => {
  t.plan(3)
  let { decompress } = sut
  let gzip = decompress('gzip', gzipSync(data))
  let br = decompress('br', brotliCompressSync(data))
  let deflate = decompress('deflate', deflateSync(data))
  t.equal(gzip, data, 'gzip returned correct data')
  t.equal(br, data, 'br returned correct data')
  t.equal(deflate, data, 'deflate returned correct data')
})
