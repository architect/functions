/**
 * returns static assets from s3
 * caches in memory as much as possible
 * you can speed things up farther by turning on bucket acceration in the console
 *
 * basic usage:
 *
 *  let arc = require('@architect/functions')
 *
 *  exports.handler = arc.proxy.public()
 *
 *
 * with more control:
 *
 *  let arc = require('@architect/functions')
 *
 *  exports.handler = async function http(req) {
 *    let body = await arc.proxy.read(req)
 *    // possibly mutate body here..
 *    return {type, body}
 *  }
 *
 */
let _public = require('./public')
let read = require('./read')

module.exports = {public:_public, read}


