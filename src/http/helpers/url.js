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
  let staging = process.env.ARC_ENV === 'staging'
  let production = process.env.ARC_ENV === 'production'
  if (!process.env.ARC_LOCAL && (staging || production))
    return `/${process.env.ARC_ENV}${url}`
  return url // fallthru for ARC_ENV=testing
}
