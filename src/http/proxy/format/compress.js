let {
  gzipSync,
  gunzipSync,
  brotliCompressSync,
  brotliDecompressSync,
  deflateSync,
  inflateSync,
} = require('zlib')

function compressor (direction, type, data) {
  let compress = direction === 'compress'
  let exec = {
    gzip: compress ? gzipSync : gunzipSync,
    br: compress ? brotliCompressSync : brotliDecompressSync,
    deflate: compress ? deflateSync : inflateSync
  }
  if (!exec[type]) throw ReferenceError('Invalid compression type specified, must be gzip, br, or deflate')

  return exec[type](data)
}

module.exports = {
  compress: compressor.bind({}, 'compress'),
  decompress: compressor.bind({}, 'decompress')
}
