let b64enc = i => Buffer.from(i).toString('base64')

/**
 * Standard mock response set used in:
 * - [Architect Functions](test/unit/src/http/http-res-fixtures.js)
 * - [Architect Sandbox](test/unit/src/http/http-res-fixtures.js)
 * If you make changes to either, reflect it in the other(s)!
 */

// Content examples
let css = '.hi:before {content: "there";}'
let html = '<span>hi there</span>'
let js = `console.log('hi there')`
let json = { hi: 'there' }
let text = 'hi there'
let xml = '<hi>there</hi>'

let arc6 = {}

arc6.http = {
  // Not returning is valid, and returns a 'null' string as JSON (lol)
  noReturn: undefined,

  // ... while this sends back 0 content-length JSON
  emptyReturn: '',

  // Sending back JSON-serializable JS primitives actually coerces strings
  string: 'hi',
  object: { ok: true },
  array: [ 'howdy' ],
  buffer: Buffer.from('hi'),
  number: 42,

  // Implicit JSON returns one no longer work without statuscode + headers
  bodyOnly: {
    body: text
  },
  bodyWithStatus: {
    statusCode: 200,
    body: text
  },

  // Explicit return is the now hotness
  bodyWithStatusAndContentType: {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: text
  },

  // Any properly base64 encoded response
  encodedWithBinaryType: {
    statusCode: 200,
    body: b64enc('hi there\n'),
    headers: { 'content-type': 'application/pdf' },
    isBase64Encoded: true
  },

  // Set cookies param
  cookies: {
    statusCode: 200,
    cookies: [ 'foo', 'bar' ],
    body: text
  },

  // ... now SSL
  secureCookies: {
    statusCode: 200,
    cookies: [ 'hi=there; Secure', 'hi=there; Secure' ],
    body: text
  },

  // ... now via header
  secureCookieHeader: {
    statusCode: 200,
    headers: { 'set-cookie': 'hi=there; Secure' },
    body: text
  },

  // Invalid (HTTP APIs are comparably very forgiving, so we have to explicitly create an invalid payload)
  invalid: {
    statusCode: 'idk'
  }
}

arc6.rest = {
  /**
   * New params introduced with Arc 6+ APG-proxy-Lambda
   */
  // Set body (implicit JSON return)
  body: {
    body: text
  },

  // Set isBase64Encoded (not technically new, but implemented differently)
  isBase64Encoded: {
    body: b64enc('hi there\n'),
    isBase64Encoded: true
  },

  // Should fail in Sandbox, or convert buffer to base64 encoded body with isBase64encoded param in Functions
  buffer: {
    body: Buffer.from('hi there\n'),
  },

  // Improperly formed response: base64 encoded with valid binary content type
  encodedWithBinaryTypeBad: {
    body: b64enc('hi there\n'),
    headers: { 'Content-Type': 'application/pdf' }
  },

  // Properly formed response: base64 encoded with valid binary content type
  encodedWithBinaryTypeGood: {
    body: b64enc('hi there\n'),
    headers: { 'Content-Type': 'application/pdf' },
    isBase64Encoded: true
  },

  // Set cookie via header
  secureCookieHeader: {
    body: html,
    headers: { 'set-cookie': 'hi=there; Secure' }
  },

  // ... now with a multi-value header
  secureCookieMultiValueHeader: {
    body: html,
    multiValueHeaders: {
      'set-cookie': [ 'hi=there; Secure', 'hi=there; Secure' ]
    }
  },

  // Set multiValueHeaders
  multiValueHeaders: {
    headers: { 'Content-Type': 'text/plain', 'Set-Cookie': 'Baz' },
    multiValueHeaders: {
      'Content-Type': [ 'text/plain' ],
      'Set-Cookie': [ 'Foo', 'Bar' ]
    }
  },

  invalidMultiValueHeaders: {
    multiValueHeaders: {
      'Content-Type': 'text/plain',
      'Set-Cookie': {
        'Foo': 'Bar'
      }
    }
  }
}

let arc5 = {
  // Set body
  body: {
    body: text
  },

  // Set cacheControl
  cacheControl: {
    body: text,
    cacheControl: 'max-age=1',
    headers: { 'cache-control': 'max-age=60' } // cacheControl should win
  },

  // Test default anti-caching on HTML
  noCacheControlHTML: {
    body: html,
    headers: { 'Content-Type': 'text/html; charset=uft8' }
  },

  // Test default anti-caching on JSON
  noCacheControlJSON: {
    body: json,
    headers: { 'Content-Type': 'application/json; charset=uft8' }
  },

  // Test default anti-caching on JSON API – works in Functions, but never worked in V5
  noCacheControlJSONapi: {
    body: json,
    headers: { 'Content-Type': 'application/vnd.api+json; charset=uft8' }
  },

  // No default anti-caching on other content types
  noCacheControlOther: {
    body: text,
    headers: { 'Content-Type': 'text/plain; charset=uft8' }
  },

  // Not specifying a content type should default to JSON
  defaultsToJson: {
    body: json
  },

  // Set type
  type: {
    body: text,
    type: 'text/plain'
  },

  // Set cookie
  cookie: {
    body: html,
    cookie: 'hi=there'
  },

  // ... now SSL
  secureCookie: {
    body: html,
    cookie: 'hi=there; Secure'
  },

  // ... now via header
  secureCookieHeader: {
    body: html,
    headers: { 'set-cookie': 'hi=there; Secure' }
  },

  // Set cors
  cors: {
    body: html,
    cors: true
  },

  // Set isBase64Encoded
  isBase64Encoded: {
    body: b64enc('hi there\n'),
    isBase64Encoded: true
  },

  // ... with type param
  isBase64EncodedType: {
    body: b64enc('hi there\n'),
    type: 'application/json',
    isBase64Encoded: true
  },

  // ... with an unknown document type (in type param)
  isBase64EncodedUnknownCT: {
    body: b64enc('hi there\n'),
    headers: { 'content-type': 'application/pdf' },
    isBase64Encoded: true
  },
}

let arc4 = {
  /**
   * Deprecated statically-bound content type style responses
   */
  css: { css },
  html: { html },
  js: { js },
  json: { json },
  text: { text },
  xml: { xml }
}

let arc = {
  /**
   * Arc Functions + early Arc response params
   */
  // Set location
  location: {
    location: '/hi'
  },

  // Set statusCode via status
  status: {
    status: 201
  },

  // Set statusCode via code
  code: {
    code: 201
  },

  // Set statusCode
  statusCode: {
    statusCode: 201
  },

  // Set session
  session: {
    session: { hi: 'there' }
  }
}

module.exports = {
  arc6,
  arc5,
  arc4,
  arc
}
