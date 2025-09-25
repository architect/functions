const { readFileSync, existsSync } = require('node:fs')
const { join } = require('node:path')

/**
 * Architect static asset helper
 * - Returns the live asset path and filename
 *
 * In order to keep this method sync, it does not use reflection to get fingerprint status
 * - Not checking @static fingerprint true (which we used to read from the .arc file) is possibly dangerous, so ensure asset path is valid
 * - ? TODO: add fingerprint state to env vars in Arc 6 to restore config safety?
 * @param {string} asset - the path to the asset (eg. /index.js)
 * @returns {string} path - the resolved asset path (eg. /_static/index-xxx.js)
 */
module.exports = function _static(asset, options = {}) {
  const { ARC_ENV, ARC_LOCAL } = process.env
  const key = asset[0] === '/' ? asset.substring(1) : asset
  const isIndex = asset === '/'
  const manifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'static.json')
  const exists = existsSync(manifest)
  const local = ARC_ENV === 'testing' || ARC_LOCAL
  const stagePath = options.stagePath && !local ? `/${ARC_ENV}` : ''
  const path = `${stagePath}/_static`
  if (!local && exists && !isIndex) {
    const read = (p) => readFileSync(p).toString()
    const pkg = JSON.parse(read(manifest))
    const asset = pkg[key]
    if (!asset) return `${path}/${key}`
    return `${path}/${asset}`
  }
  return `${path}/${isIndex ? '' : key}`
}
