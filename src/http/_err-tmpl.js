/* eslint  global-require: "off" */
var path = require('path')

module.exports = function html(err) {
  try {
    var override = require(path.join(process.cwd(), 'error'))
    var page = override(err)
    if (page.length === 0) throw Error('noop')
    return page
  }
  catch(e) {
    // if the override fails show the default error template
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
}
