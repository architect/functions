let { readFileSync, existsSync } = require('fs')
let { join } = require('path')

/**
 * Architect static asset helper
 * - Returns the live asset path and filename
 *
 * In order to keep this method sync, it does not use reflection to get fingerprint status
 * - Not checking @static fingerprint true (which we used to read from the .arc file) is possibly dangerous, so ensure asset path is valid
 * - ? TODO: add fingerprint state to env vars in Arc 6 to restore config safety?
 * @param {string} asset - the path to the asset (eg. /index.js)
 * @param {{stagePath: string}} options - options to pass to the helper
 * @returns {string} path - the resolved asset path (eg. /_static/index-xxx.js)
 */
module.exports = function _static (asset, options = {}) {
  let { ARC_ENV, ARC_LOCAL } = process.env
  let key = asset[0] === '/' ? asset.substring(1) : asset
  let isIndex = asset === '/'
  let manifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'static.json')
  let exists = existsSync(manifest)
  let local = ARC_ENV === 'testing' || ARC_LOCAL
  let stagePath = options.stagePath && !local ? '/' + ARC_ENV : ''
  let path = `${stagePath}/_static`
  if (!local && exists && !isIndex) {
    let read = p => readFileSync(p).toString()
    let pkg = JSON.parse(read(manifest))
    let asset = pkg[key]
    if (!asset)
      throw ReferenceError(`Could not find asset in static.json (asset fingerprint manifest): ${key}`)
    return `${path}/${asset}`
  }
  return `${path}/${isIndex ? '' : key}`
}
