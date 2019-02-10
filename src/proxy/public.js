let read = require('./read')
/**
 * arc.proxy.public
 *
 * @param config - object, for configuration
 * @param config.spa - boolean, forces index.html no matter the folder depth
 * @param config.plugins - object, configure proxy-plugin-* transforms per file extension
 * @param config.alias - object, map of root rel urls to map to fully qualified root rel urls
 *
 * @returns HTTPLambda - an HTTP Lambda function that proxies calls to S3
 */
module.exports = function proxyPublic(config) {
  return async function proxy(req) {

    // first we need to determine the S3 Key
    let Key

    if (config.spa) {
      // if spa force index.html
      let isFolder = req.path.split('/').pop().indexOf('.') === -1
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

    // allow alias override of Key
    let aliasing = config.alias && config.alias.hasOwnProperty(req.path)
    if (aliasing) {
      Key = config.alias[req.path].substring(1) // remove leading /
    }

    // return the blob
    return await read(Key, config)
  }
}
