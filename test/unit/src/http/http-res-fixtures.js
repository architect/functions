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
let json = {hi: 'there'}
let text = 'hi there'
let xml = '<hi>there</hi>'

let arc6 = {
  /**
   * New params introduced with Arc 6+ APG-proxy-Lambda
   */
  // Set isBase64Encoded (not technically new, but implemented differently)
  isBase64Encoded: {
    body: b64enc('hi there\n'),
    isBase64Encoded: true
  },

  // Should fail in Sandbox, or convert buffer to base64 encoded body with isBase64encoded param in Functions
  buffer: {
    body: Buffer.from('hi there\n'),
  },

  // Base64 encoded with valid binary content type
  encodedWithBinaryType: {
    body: b64enc('hi there\n'),
    headers: {'Content-Type': 'application/pdf'}
  }
}

let arc5 = {
  /**
   * Arc Functions response format
   */
  // Set body
  body: {
    body: 'hi there'
  },

  // Set cacheControl
  cacheControl: {
    body: 'hi there',
    cacheControl: 'max-age=1',
    headers: {'cache-control': 'max-age=60'} // cacheControl should win
  },

  // Test default anti-caching on HTML
  noCacheControlHTML: {
    body: html,
    headers: {'Content-Type': 'text/html; charset=uft8'}
  },

  // Test default anti-caching on JSON
  noCacheControlJSON: {
    body: json,
    headers: {'Content-Type': 'application/json; charset=uft8'}
  },

  // No default anti-caching on other content types
  noCacheControlOther: {
    body: text,
    headers: {'Content-Type': 'text/plain; charset=uft8'}
  },

  // Not specifying a content type should default to JSON
  defaultsToJson: {
    body: json
  },

  /**
   * Dependency-free response format
   */
  // Set type
  type: {
    body: 'hi there',
    type: 'text/plain'
  },

  // Set cookie
  cookie: {
    body: html,
    cookie: {hi: 'there'}
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
  }
}

let arc4 = {
  /**
   * Deprecated statically-bound content type style responses
   */
  css: {css},
  html: {html},
  js: {js},
  json: {json},
  text: {text},
  xml: {xml}
}

let arc = {
  /**
   * Arc version agnostic response params
   */
  // Set location
  locationHi: {
    location: '/hi'
  },

  // Set status
  status201: {
    status: 201
  },

  // Set code
  code201: {
    code: 201
  },

  // Set statusCode
  statusCode201: {
    statusCode: 201
  },

  // Set session
  session: {
    session: {hi: 'there'}
  }
}

module.exports = {
  arc6,
  arc5,
  arc4,
  arc
}
