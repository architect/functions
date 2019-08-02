// Content examples
let css = '.hi:before {content: "there";}'
let html = '<span>hi there</span>'
let js = `console.log('hi there')`
let json = {hi: 'there'}
let text = 'hi there'
let xml = '<hi>there</hi>'

let arc5 = {
  /**
   * Arc Functions response format
   */
  body: {
    body: 'hi there'
  },
  cacheControl: {
    body: 'hi there',
    cacheControl: 'max-age=0',
    headers: {'cache-control': 'max-age=60'} // cacheControl should win
  },
  noCacheControlHTML: {
    body: html,
    headers: {'Content-Type': 'text/html; charset=uft8'}
  },
  noCacheControlJSON: {
    body: json,
    headers: {'Content-Type': 'application/json; charset=uft8'}
  },
  noCacheControlOther: {
    body: text,
    headers: {'Content-Type': 'text/plain; charset=uft8'}
  },
  defaultsToJson: {
    body: json
  },

  /**
   * Dependency-free response format
   */
  type: {
    body: 'hi there',
    type: 'text/plain'
  },
  cookie: {
    body: html,
    cookie: {hi: 'there'}
  },
  cors: {
    body: html,
    cors: true
  }
}

let arc4 = {

  css: {css},
  html: {html},
  js: {js},
  json: {json},
  text: {text},
  xml: {xml}
}

let arc = {
  locationHi: {
    location: '/hi'
  },
  status201: {
    status: 201
  },
  code201: {
    code: 201
  },
  statusCode201: {
    statusCode: 201
  },
  session: {
    session: {hi: 'there'}
  }
}

module.exports = {
  arc5,
  arc4,
  arc
}
