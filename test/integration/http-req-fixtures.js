let arc5 = {
  // get /
  getIndex: {
    body: {},
    path: '/',
    headers: {'Accept-Encoding': 'gzip'},
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
    headers: {'Accept-Encoding': 'gzip'},
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
    headers: {'Accept-Encoding': 'gzip'},
    method: 'GET',
    httpMethod: 'GET',
    params: {activities:'hiking'},
    query: {},
    queryStringParameters: {}
  },

  // post /form
  //   accounts for both JSON and form URL-encoded bodies
  post: {
    body: {hello: 'there'},
    path: '/form',
    headers: {'Accept-Encoding': 'gzip'},
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
    headers: {'Accept-Encoding': 'gzip'},
    method: 'POST',
    httpMethod: 'POST',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // put /form
  put: {
    body: {hello: 'there'},
    path: '/form',
    headers: {'Accept-Encoding': 'gzip'},
    method: 'PUT',
    httpMethod: 'PUT',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // patch /form
  patch: {
    body: {hello: 'there'},
    path: '/form',
    headers: {'Accept-Encoding': 'gzip'},
    method: 'PATCH',
    httpMethod: 'PATCH',
    params: {},
    query: {},
    queryStringParameters: {}
  },

  // delete /form
  delete: {
    body: {hello: 'there'},
    path: '/form',
    headers: {'Accept-Encoding': 'gzip'},
    method: 'DELETE',
    httpMethod: 'DELETE',
    params: {},
    query: {},
    queryStringParameters: {}
  },
}

module.exports = {
  arc5
}
