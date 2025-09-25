/**
 * No magic url helper for legacy REST APIs
 * Given path `/`, it returns:
 *
 * - `/` if ARC_ENV === testing
 * - `/staging` if ARC_ENV === staging
 * - `/production` if ARC_ENV === production
 */
module.exports = function url(_url) {
  const { ARC_ENV, ARC_LOCAL } = process.env
  const staging = ARC_ENV === 'staging'
  const production = ARC_ENV === 'production'
  if (!ARC_LOCAL && (staging || production)) return `/${ARC_ENV}${_url}`
  return _url // fallthru for ARC_ENV=testing
}
