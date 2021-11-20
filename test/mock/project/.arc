@app
test-only

@http
get /http-session
get /http-async-session

@ws

@tables
arc-sessions
  _idx *String
  _ttl TTL
