let fs = require('fs')
let path = require('path')
let url = require('url').format
let readLocalArc = require('../utils/read-local-arc')
let arc

/**
 * Architect static asset helper
 * - Returns the live asset filename
 *
 * In order to keep this method sync, it does not use reflection to get fingerprint status
 * - Checking @static fingerprint true is something we used to do reading the .arc file
 * - No longer doing this is vaguely more dangerous, so we'll do checks to ensure assetPath validity
 * - ? TODO: add fingerprint state to env vars in Arc 6 to restore safety in that configuration?
 */
module.exports = function _static(assetPath, options) {
  // Normalize to no leading slash
  if (assetPath[0] === '/') assetPath = assetPath.substring(1)

  // Env stuff
  let env = process.env.NODE_ENV
  let runningLocally = !env || env === 'testing' || process.env.ARC_LOCAL

  let staticManifest
  let folder = process.env.ARC_STATIC_FOLDER
    ? '/' + process.env.ARC_STATIC_FOLDER
    : ''
  let region = process.env.AWS_REGION
  let S3domain = bucket => `https://${bucket}.s3.${region}.amazonaws.com${folder}/`

  // TODO add options
  // - fingerprinted filename only (nice for proxy uses)
  // - force serving from /_static
  // - CDN / alternate domain prefix

  // Just pass through request if not in staging or production
  if (runningLocally) {
    return `/_static/${assetPath}`
  }
  else {
    // Infer fingerprint status from presence of static.json in shared
    let staticManifestFile = path.join(process.cwd(), 'node_modules', '@architect', 'shared', 'static.json')
    if (fs.existsSync(staticManifestFile)) {
      try {
        staticManifest = JSON.parse(fs.readFileSync(staticManifestFile))
      }
      catch(e) {
        throw ReferenceError('Could not parse static.json (asset fingerprint manifest)')
      }
    }

    // Rewrite the file path with the fingerprinted filename
    if (staticManifest)
      assetPath = staticManifest[assetPath]

    // Potentially detect filename conflict jic
    if (!assetPath) {
      throw ReferenceError('Could not find asset in static.json (asset fingerprint manifest)')
    }
    /**
     * Static env var takes precedence if present
     *   Generally, but not exclusively, Arc 6+
     */
    else if (process.env.ARC_STATIC_BUCKET) {
      let raw = S3domain(process.env.ARC_STATIC_BUCKET) + assetPath
      return url(raw)
    }
    /**
     * Fall back to local .arc files ()
     *   Generally !Arc 6+
     */
    else {
      // Only load the arc file once (if possible)
      if (!arc || options && options.reload) {
        arc = readLocalArc()
      }
      if (arc && !arc.static) {
        throw ReferenceError('Cannot return static asset path without @static pragma configured in Architect project manifest')
      }
      else {
        let bucket = getBucket(arc.static)
        let raw = S3domain(bucket) + assetPath
        return url(raw)
      }
    }
  }
}

// Helper returns the @static value for the current NODE_ENV
function getBucket(_static) {
  let staging
  let production
  _static.forEach(thing=> {
    if (thing[0] === 'staging') {
      staging = thing[1]
    }
    if (thing[0] === 'production') {
      production = thing[1]
    }
  })
  if (process.env.NODE_ENV === 'staging')
    return staging
  if (process.env.NODE_ENV === 'production')
    return production
}
