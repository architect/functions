@app
test-only

# Not really necessary for testing sessions anymore, but feel free to uncomment if you need to!
# @http
# get /

@tables
arc-sessions
  _idx *String
  _ttl TTL
