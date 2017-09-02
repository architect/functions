var serialize = require('serialize-error')

module.exports = function _err(type, callback, err) {

  // setup a json payload for api gateway
  var exception = {
    statusCode: 500
  }

  // if the thrown error has a code of 403, 404 or 500
  var hasCode = err.code && Number.isInteger(err.code) && [403, 404, 500].includes(err.code)
  if (hasCode) {
    exception = err.code
  }

  var hasStatus = err.status && Number.isInteger(err.status) && [403, 404, 500].includes(err.status)
  if (hasStatus) {
    exception = err.status
  }

  var hasStatusCode = err.statusCode && Number.isInteger(err.statusCode) && [403, 404, 500].includes(err.statusCode)
  if (hasStatusCode) {
    exception = err.statusCode
  }

  var isHTML = type === 'text/html'
  if (isHTML) {
    exception.html = html(err)
  }
  else {
    exception.json = serialize(err)
  }

  callback(JSON.stringify(exception))
}

function html(err) {
  return `<!doctype html>
<html>
<head>
<meta name=viewport content=width=device-width,initial-scale=1>
<style>
body {
  font-family: sans-serif;
  color: #999;
}

h1 {
  width: 850px;
  color: black;
  font-size: 2em;
  margin: 5% auto 20px auto;
}

pre {
  width: 850px;
  margin: 0 auto 0 auto;
}
</style>
</head>
<body>
<h1>${err.toString()}</h1>
<pre>${err.stack}</pre>
</body>
</html>
`
}
