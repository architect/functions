let binaryTypes = require('../helpers/binary-types')
let normalizeResponse = require('./response')
let mime = require('mime-types')
let path = require('path')
let fs = require('fs')
let util = require('util')
let readFile = util.promisify(fs.readFile)
let transform = require('./transform')

module.exports = async function sandbox({Key, config}) {
  // additive change... after 6.x we can rely on this env var in sandbox
  let basePath = process.env.ARC_SANDBOX_PATH_TO_STATIC || path.join(process.cwd(), '..', '..', '..', 'public')

  // Look up the blob
  // assuming we're running from a lambda in src/**/* OR from vendored node_modules/@architect/sandbox
  let filePath = path.join(basePath, Key)
  let staticFolder = process.env.ARC_STATIC_FOLDER
  if (filePath.includes(staticFolder)) filePath = filePath.replace(`${staticFolder}${path.sep}`, '')

  try {
    if (!fs.existsSync(filePath))
      throw ReferenceError(`${filePath} not found`)

    let body = await readFile(filePath)
    let type = mime.contentType(path.extname(Key))
    let isBinary = binaryTypes.some(t => type.includes(t))

    let response = transform({
      Key,
      config,
      isBinary,
      defaults: {
        headers: {'content-type': type},
        body
      }
    })

    // Normalize response
    response = normalizeResponse({
      response,
      Key,
      config
    })

    return response
  }
  catch(e) {
    // look for public/404.html
    let headers = {'content-type': 'text/html; charset=utf8;'}
    let http404 = path.join(basePath, '404.html')
    let exists = fs.existsSync(http404)
    if (exists) {
      let body = await readFile(http404, {encoding: 'utf8'})
      return {headers, statusCode:404, body}
    }
    let err = `
      <h1>${e.name}</h1>
      <pre>${e.code}</pre>
      <p>${e.message}</p>
      <pre>${e.stack}</pre>
    `
    return {headers, body:err}
  }
}
