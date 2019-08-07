let b64enc = i => new Buffer.from(i).toString('base64')
let headers = {'Accept-Encoding': 'gzip'}

/**
 * Standard mock request set used in:
 * - [Architect Functions](test/unit/src/http/http-req-fixtures.js)
 * - [Architect Sandbox](test/unit/src/http/http-req-fixtures.js)
 * If you make changes to either, reflect it in the other(s)!
 */
let arc6 = {
  // get /
  getIndex: {
    body: null,
    path: '/',
    headers,
    httpMethod: 'GET',
    pathParameters: null,
    queryStringParameters: null
  },

  // get /?whats=up
  getWithQueryString: {
    body: null,
    path: '/',
    headers,
    httpMethod: 'GET',
    pathParameters: null,
    queryStringParameters: {whats:'up'}
  },

  // get /nature/hiking
  getWithParam: {
    body: null,
    path: '/nature/hiking',
    resource: '/nature/{activities}',
    headers,
    httpMethod: 'GET',
    pathParameters: {activities:'hiking'},
    queryStringParameters: null
  },

  // post /form (JSON)
  postJson: {
    body: b64enc(JSON.stringify({hi: 'there'})),
    path: '/form',
    headers: {'Content-Type': 'application/json'},
    httpMethod: 'POST',
    pathParameters: null,
    queryStringParameters: null,
    isBase64Encoded: true
  },

  // post /form (form URL encoded)
  postFormURL: {
    body: b64enc('hi=there'),
    path: '/form',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    httpMethod: 'POST',
    pathParameters: null,
    queryStringParameters: null,
    isBase64Encoded: true
  },

  // post /form (multipart form data)
  postMultiPartFormData: {
    body: b64enc('hi there'), // not a valid multipart form data payload but that's for userland validation
    path: '/form',
    headers: {'Content-Type': 'multipart/form-data'},
    httpMethod: 'POST',
    pathParameters: null,
    queryStringParameters: null,
    isBase64Encoded: true
  },

  // post /form (octet stream)
  postOctetStream: {
    body: b64enc('hi there\n'),
    path: '/form',
    headers: {'Content-Type': 'application/octet-stream'},
    httpMethod: 'POST',
    pathParameters: null,
    queryStringParameters: null,
    isBase64Encoded: true
  },

  // put /form (JSON)
  putJson: {
    body: b64enc(JSON.stringify({hi: 'there'})),
    path: '/form',
    headers: {'Content-Type': 'application/json'},
    httpMethod: 'PUT',
    pathParameters: null,
    queryStringParameters: null,
    isBase64Encoded: true
  },

  // patch /form (JSON)
  patchJson: {
    body: b64enc(JSON.stringify({hi: 'there'})),
    path: '/form',
    headers: {'Content-Type': 'application/json'},
    httpMethod: 'PATCH',
    pathParameters: null,
    queryStringParameters: null,
    isBase64Encoded: true
  },

  // delete /form (JSON)
  deleteJson: {
    body: b64enc(JSON.stringify({hi: 'there'})),
    path: '/form',
    headers: {'Content-Type': 'application/json'},
    httpMethod: 'DELETE',
    pathParameters: null,
    queryStringParameters: null,
    isBase64Encoded: true
  }
}

let arc5 = {
  // get /
  getIndex: {
    body: {},
    path: '/',
    headers,
    method: 'GET',
    httpMethod: 'GET',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // get /?whats=up
  getWithQueryString: {
    body: {},
    path: '/',
    headers,
    method: 'GET',
    httpMethod: 'GET',
    params: {},
    query: {whats:'up'},
    queryStringParameters: {whats:'up'}
  },

  // get /nature/hiking
  getWithParam: {
    body: {},
    path: '/nature/{activities}',
    headers,
    method: 'GET',
    httpMethod: 'GET',
    params: {activities:'hiking'},
    query: {},
    queryStringParameters: {}
  },

  // post /form
  //   accounts for both JSON and form URL-encoded bodies
  post: {
    body: {hi: 'there'},
    path: '/form',
    headers,
    method: 'POST',
    httpMethod: 'POST',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // post /form
  //   accounts for multipart form data-encoded bodies
  postBinary: {
    body: {base64: 'aGVsbG89dGhlcmU='},
    path: '/form',
    headers,
    method: 'POST',
    httpMethod: 'POST',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // put /form
  put: {
    body: {hi: 'there'},
    path: '/form',
    headers,
    method: 'PUT',
    httpMethod: 'PUT',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // patch /form
  patch: {
    body: {hi: 'there'},
    path: '/form',
    headers,
    method: 'PATCH',
    httpMethod: 'PATCH',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // delete /form
  delete: {
    body: {hi: 'there'},
    path: '/form',
    headers,
    method: 'DELETE',
    httpMethod: 'DELETE',
    params: {},
    query: {},
    queryStringParameters: {}
  },
}

module.exports = {
  arc6,
  arc5
}
