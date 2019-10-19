const {readFileSync, existsSync} = require('fs')
const {join} = require('path')

/**
 * Architect static asset helper
 * - Returns the live asset filename
 *
 * In order to keep this method sync, it does not use reflection to get fingerprint status
 * - Not checking @static fingerprint true (which we used to read from the .arc file) is possibly dangerous, so ensure asset path is valid
 * - ? TODO: add fingerprint state to env vars in Arc 6 to restore safety in that configuration?
 *
 * @param {string} path - the path to the asset (eg. /index.js)
 * @returns {string} path - the resolved asset path (eg. /_static/index-xxx.js)
 */
module.exports = function _static(path) {
  let key = path[0] === '/'? path.substring(1) : path
  let manifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'static.json')
  let exists = existsSync(manifest)
  let local = process.env.NODE_ENV === 'testing' || process.env.ARC_LOCAL
  if (!local && exists) {
    let read = p=> readFileSync(p).toString()
    let pkg = JSON.parse(read(manifest))
    let asset = pkg[key]
    if (!asset)
      throw ReferenceError('Could not find asset in static.json (asset fingerprint manifest)')
    return `/_static/${asset}`
  }
  return `/_static/${key}`
}
