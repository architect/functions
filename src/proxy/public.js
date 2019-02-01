let path = require('path')
let mime = require('mime-types')
let read = require('./read')

// defaults
let headers = {
  'Content-Type': 'text/html; charset=utf8'
}

module.exports = function proxyPublic({spa}) {
  return async function proxy(req) {
    try {
      let Key
      if (spa) {
        let isFolder = req.path.indexOf('.') === -1
        Key = isFolder? 'index.html' : req.path.substring(1)
      }
      else {
        // Lookup the Key w smarts for index.html (this needs improvement)
        Key = req.path === '/'? 'index.html' : req.path.substring(1)
        // add index.html to any empty folder path
        if (Key != 'index.html' && req.path.lastIndexOf('/') === req.path.length - 1) {
          Key = Key + 'index.html'
        }
      }

      // overide Content-Type by Key mime-type
      headers['Content-Type'] = mime.contentType(path.extname(Key))

      // read the blob
      let body = await read(Key)

      // return the blob
      return {headers, body}
    }
    catch(e) {
      return {
        headers,
        body: `Error ${e.message} <pre>${e.stack}</pre>`,
        statusCode: 500,
      }
    }
  }
}
