let parseBody = require('../../../../src/http/helpers/parse-body')
let test = require('tape')

let str = i => JSON.stringify(i)

// Bodies
let hi = {hi: 'there'}
let hiBase64 = {base64: 'aGk9dGhlcmU='} // Arc 5
let hiFormURL = 'hi=there'

// Content types
let json = {'Content-Type': 'application/json'}
let formURLencoded = {'Content-Type': 'application/x-www-form-urlencoded'}
let multipartFormData = {'Content-Type': 'multipart/form-data'}
let octetStream = {'Content-Type': 'application/octet-stream'}

test('Architect v6+ requests', t => {
  t.plan(5)
  // Pass through empty body (although in practice we'll never see this, as we transform to empty object)
  let req = {
    body: null,
    headers: json
  }
  t.equals(str(parseBody(req).body), str(null), `body matches ${str(req.body)}`)

  req = {
    body: new Buffer.from(str(hi)).toString('base64'),
    headers: json,
    isBase64Encoded: true
  }
  t.equals(str(parseBody(req).body), str(hi), `body matches ${str(req.body)}`)

  // Test faulty encoding on JSON posts
  req.body = str(hi)
  t.throws(() => str(parseBody(req)), 'Raw JSON fails')
  req.body = new Buffer.from('hello there').toString('base64')
  t.throws(() => str(parseBody(req)), 'Base64 encoded non-JSON string fails')

  req = {
    body: new Buffer.from(hiFormURL).toString('base64'),
    headers: formURLencoded,
    isBase64Encoded: true
  }
  t.equals(str(parseBody(req).body), str(hi), `body matches ${str(req.body)}`)
  // Not test faulty encoding on form URL-encoded posts; you'll always get something back

  // Multi-part form data + octet stream tests covered in Arc 5 tests
})

test('Architect v5 requests', t => {
  t.plan(5)
  // Pass through empty body
  let req = {
    body: {},
    headers: json
  }
  t.equals(parseBody(req), req, `body matches ${str(req.body)}`)

  // Pass through parsed body (JSON)
  req = {
    body: hi,
    headers: json
  }
  t.equals(str(parseBody(req).body), str(hi), `body matches ${str(req.body)}`)

  // Pass through parsed body (formURLencoded)
  req = {
    body: hi,
    headers: formURLencoded
  }
  t.equals(str(parseBody(req).body), str(hi), `body matches ${str(req.body)}`)

  // Pass through multipart / base64
  req = {
    body: hiBase64,
    headers: multipartFormData
  }
  t.equals(str(parseBody(req).body), str(hiBase64), `body matches ${str(req.body)}`)

  // Pass through octet stream / base64
  req.headers = octetStream
  t.equals(str(parseBody(req).body), str(hiBase64), `body matches ${str(req.body)}`)
})
