let parseBody = require('../../../../../src/http/helpers/body-parser')
let test = require('tape')

let str = i => JSON.stringify(i)
let b64encode = i => new Buffer.from(i).toString('base64')

// Bodies
let hi = {hi: 'there'}
let hiBase64 = {base64: b64encode('hi there')} // Arc 5
let hiBase64file = b64encode('hi there\n') // text file style
let hiFormURL = b64encode('hi=there')

// Content types
let json = {'Content-Type': 'application/json'}
let formURLencoded = {'Content-Type': 'application/x-www-form-urlencoded'}
let multiPartFormData = {'Content-Type': 'multipart/form-data'}
let octetStream = {'Content-Type': 'application/octet-stream'}

test('Architect v6+ requests', t => {
  t.plan(8)
  // Pass through empty body (although in practice we'll never see this, as we transform to empty object)
  let req = {
    body: null,
    headers: json
  }
  t.equals(str(parseBody(req)), str(null), `body matches ${str(req.body)}`)

  req = {
    body: b64encode(str(hi)),
    headers: json,
    isBase64Encoded: true
  }
  t.equals(str(parseBody(req)), str(hi), `body matches ${str(req.body)}`)

  // Alt JSON API
  req = {
    body: b64encode(str(hi)),
    headers: {'Content-Type': 'application/vnd.api+json'},
    isBase64Encoded: true
  }
  t.equals(str(parseBody(req)), str(hi), `body matches ${str(req.body)}`)

  // Test faulty encoding on JSON posts
  req.body = str(hi)
  t.throws(() => str(parseBody(req)), 'Raw JSON fails')
  req.body = b64encode('hello there')
  t.throws(() => str(parseBody(req)), 'Base64 encoded non-JSON string fails')

  req = {
    body: hiFormURL,
    headers: formURLencoded,
    isBase64Encoded: true
  }
  t.equals(str(parseBody(req)), str(hi), `body matches ${str(req.body)}`)
  // Not test faulty encoding on form URL-encoded posts; you'll always get something back

  // Pass through multipart / base64
  req = {
    body: hiBase64file,
    headers: multiPartFormData,
    isBase64Encoded: true
  }
  t.equals(str(parseBody(req)), str({base64: hiBase64file}), `body matches ${str(req.body)}`)

  // Pass through octet stream / base64
  req.headers = octetStream
  t.equals(str(parseBody(req)), str({base64: hiBase64file}), `body matches ${str(req.body)}`)

})

test('Architect v5 requests', t => {
  t.plan(5)
  // Pass through empty body
  let req = {
    body: {},
    headers: json
  }
  t.equals(parseBody(req), req.body, `body matches ${str(req.body)}`)

  // Pass through parsed body (JSON)
  req = {
    body: hi,
    headers: json
  }
  t.equals(str(parseBody(req)), str(hi), `body matches ${str(req.body)}`)

  // Pass through parsed body (formURLencoded)
  req = {
    body: hi,
    headers: formURLencoded
  }
  t.equals(str(parseBody(req)), str(hi), `body matches ${str(req.body)}`)

  // Pass through multipart / base64
  req = {
    body: hiBase64,
    headers: multiPartFormData
  }
  t.equals(str(parseBody(req)), str(hiBase64), `body matches ${str(req.body)}`)

  // Pass through octet stream / base64
  req.headers = octetStream
  t.equals(str(parseBody(req)), str(hiBase64), `body matches ${str(req.body)}`)
})
