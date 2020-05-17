let { existsSync, readFileSync } = require('fs')
let { extname, join, sep } = require('path')
let mime = require('mime-types')

let binaryTypes = require('../../helpers/binary-types')
let { httpError } = require('../../errors')
let transform = require('../format/transform') // Soon to be deprecated
let templatizeResponse = require('../format/templatize')
let normalizeResponse = require('../format/response')
let pretty = require('./_pretty')

/**
 * arc.http.proxy.read
 *
 * Reads a file from the local filesystem, resolving an HTTP Lambda friendly payload
 *
 * @param {Object} params
 * @param {String} params.Key
 * @param {String} params.IfNoneMatch
 * @param {String} params.isFolder
 * @param {String} params.isProxy
 * @param {Object} params.config
 * @returns {Object} {statusCode, headers, body}
 */
module.exports = async function readLocal (params) {

  let { ARC_SANDBOX_PATH_TO_STATIC, ARC_STATIC_FOLDER } = process.env
  let { Key, isProxy, isFolder, config, assets } = params

  // After 6.x we can rely on this env var in sandbox
  let basePath = ARC_SANDBOX_PATH_TO_STATIC || join(process.cwd(), '..', '..', '..', 'public')

  // Double check for assets in case we're running as proxy at root in sandbox
  let staticManifest = join(basePath, 'static.json')
  if (!assets && existsSync(staticManifest)) {
    let file = readFileSync(staticManifest).toString()
    assets = JSON.parse(file)
  }

  // Look up the blob
  // assuming we're running from a lambda in src/**/* OR from vendored node_modules/@architect/sandbox
  let filePath = join(basePath, Key)
  let staticFolder = ARC_STATIC_FOLDER
  if (filePath.includes(staticFolder)) {
    filePath = filePath.replace(`${staticFolder}${sep}`, '')
  }

  try {
    if (!existsSync(filePath)) {
      let err = ReferenceError(`NoSuchKey: ${filePath} not found`)
      err.name = 'NoSuchKey'
      throw err
    }

    let body = readFileSync(filePath).toString()
    let type = mime.contentType(extname(Key))
    let isBinary = binaryTypes.some(t => type.includes(t))

    // TODO impl ETag / ifnonematch

    let response = transform({
      Key,
      config,
      isBinary,
      defaults: {
        headers: {'content-type': type},
        body
      }
    })

    // Handle templating
    response = templatizeResponse({
      isBinary,
      assets,
      response,
      isSandbox: true
    })

    // Normalize response
    response = normalizeResponse({
      response,
      Key,
      isProxy,
      config
    })

    return response
  }
  catch (err) {
    let notFound = err.name === 'NoSuchKey'
    if (notFound) {
      return await pretty({ Key: filePath, config, isFolder })
    }
    else {
      let title = err.name
      let message = `
        ${err.message}<br>
        <pre>${err.stack}</pre>
      `
      return httpError({ statusCode: 500, title, message })
    }
  }
}
