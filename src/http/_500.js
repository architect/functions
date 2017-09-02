var serialize = require('serialize-error')

module.exports = function fail(type, callback, err) {
  var exception = {
    statusCode: 500
  }
  var isHTML = type === 'text/html'
  if (isHTML ) {
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
