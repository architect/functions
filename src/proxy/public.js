let read = require('./read')

/**
 * returns an HTTP handler that proxies calls to S3
 *
 * arc.proxy.public({
 *  spa: true|false,
 *  plugins: {
 *    jsx: ['@architect/proxy-plugin-jsx', '@architect/proxy-plugin-mjs-urls'],
      mjs: ['@architect/proxy-plugin-mjs-urls'],
 *  }
 * })
 */
module.exports = function proxyPublic({spa, plugins}={spa:false, plugins:{}}) {
  return async function proxy(req) {
    let Key
    if (spa) {
      // if spa force index.html
      let isFolder = req.path.indexOf('.') === -1
      Key = isFolder? 'index.html' : req.path.substring(1)
    }
    else {
      // return index.html for root…otherwise passthru the path minus leading slash
      Key = req.path === '/'? 'index.html' : req.path.substring(1)
      // add index.html to any empty folder path
      let isFolder = Key != 'index.html' && req.path.lastIndexOf('/') === req.path.length - 1
      if (isFolder) {
        Key = Key + 'index.html'
      }
    }
    // return the blob
    return await read(Key, plugins)
  }
}
