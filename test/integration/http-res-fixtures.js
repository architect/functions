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
  // Set isBase64Encoded
  isBase64Encoded: {
    body: new Buffer.from('hi there').toString('base64'),
    isBase64Encoded: true
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
    cacheControl: 'max-age=0',
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
