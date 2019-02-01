let read = require('./read')

module.exports = function proxyPublic({spa}={spa:false}) {
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
    // read the blob
    let {headers, body} = await read(Key)
    // return the blob
    return {headers, body}
  }
}
