@app
test-only

@http
get /http-session
get /http-async-session
get /incompatible-version
post /publish-event/*
get /*

@events
cb-event
async-event

@queues
cb-queue
async-queue

@tables
arc-sessions
  _idx *String
  _ttl TTL
