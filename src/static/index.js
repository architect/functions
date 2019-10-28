const {readFileSync, existsSync} = require('fs')
const {join} = require('path')

/**
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
    return `/_static/${pkg[key]}`
  }
  return `/_static/${key}`
}
