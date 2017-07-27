/**
 * hidden helper on req._stage (with current request bound as the first param)
 *
 * usage
 *
 *  function route(req, res) {
 *    var url = req._url('/about')
 *    console.log(url)
 *    res({
 *      location: url
 *    })
 *  }
 *
 * logs
 *   /staging/about (when NODE_ENV=staging and DNS not setup)
 *   /production/about (when NODE_ENV=production and DNS not setup)
 *   /about (when NODE_ENV=testing or DNS setup)
 *
 */
module.exports = function _url(req, url) {
  var isStaging = process.env.NODE_ENV === 'staging' && req.headers.Host && req.headers.Host.includes('amazonaws.com')
  var isProduction = process.env.NODE_ENV === 'production' && req.headers.Host && req.headers.Host.includes('amazonaws.com')
  if (isStaging || isProduction) return `/${process.env.NODE_ENV}${url}`
  return url // fallthru for NODE_ENV=testing and when dns setup
}
