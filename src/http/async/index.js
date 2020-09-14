let read = require('../session/read')
let write = require('../session/write')
let bodyParser = require('../helpers/body-parser')
let interpolate = require('../helpers/params')
let responseFormatter = require('../_res-fmt')

/**
 * `arc.http.async` accepts one or more async functions
 *
 * Each function is a regular Arc 4+ async/await route function, that may return:
 * - A falsy value .......... move onto the next function
 * - A modified `request` ... move onto the next function, passing the mutated `request` on to any subsequent functions
 * - A `response` ........... end execution and respond to the client
 */
module.exports = function httpAsync (...fns) {

  // Ensure we've been passed only functions
  fns.forEach(f => {
    if (typeof f != 'function')
      throw TypeError(f + ' not a function')
  })

  // Return an AWS Lambda async function signature
  async function combined (request, context) {
    let params
    let first = true
    for (let fn of fns) {
      // Only parse the request obj of the first function
      if (first) {
        first = false
        let session = await read(request)
        let req = interpolate(Object.assign({}, request, { session }))
        req.body = bodyParser(req)
        request = req
      }
      // Run the function
      let result = await fn(request, context)
      let isRequest = result && result.httpMethod
      if (isRequest) {
        // Function returned a modified request, continuing...
        request = result
      }
      else {
        if (result) {
          params = result
          // Got a response, finishing...
          break
        }
        // Did not get a result from, continuing...
      }
    }
    let isHTTPv2 = request.version && request.version === '2.0'
    // Finished combined function!
    if (!params && !isHTTPv2) {
      throw new Error(`Finished all functions without returning a response.`)
    }
    return response(request, params)
  }
  return combined
}

async function response (req, params) {
  // Format the response
  let res = responseFormatter(req, params)

  // Tag the new session
  if (params && (params.session || params.cookie)) {
    let session = params.session || params.cookie
    session = Object.keys(session).length === 0 ? {} : Object.assign({}, req.session, session)
    // Save the session
    let cookie = await write(session)
    res.headers['Set-Cookie'] = cookie
  }
  return res
}
