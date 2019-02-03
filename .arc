@app
test-only

@http
get /

@tables
arc-sessions
  _idx *String
  _ttl TTL
