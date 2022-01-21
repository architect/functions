/**
 * no magic url helper
 *
 * given a path / returns
 *
 * - / if ARC_ENV === testing
 * - /staging if ARC_ENV === staging
 * - /production if ARC_ENV === production
 */
module.exports = function url (url) {
  let { ARC_ENV, ARC_LOCAL } = process.env
  let staging = ARC_ENV === 'staging'
  let production = ARC_ENV === 'production'
  if (!ARC_LOCAL && (staging || production))
    return `/${ARC_ENV}${url}`
  return url // fallthru for ARC_ENV=testing
}
