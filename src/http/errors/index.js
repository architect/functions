/**
 * HTTP error response generator and template
 */
module.exports = {
  httpError,
  proxyConfig: proxyConfig()
}

function proxyConfig () {
  let title = 'Index not found'
  let message = `No static asset bucket or <code>get /</code> function found in your project. Possible solutions:<br?
<ul>
  <li>Add <code>@static</code> to your project manifest</li>
  <li>Add <code>get /</code> to the <code>@http</code> pragma of your project manifest</li>
  <li>Manually specify an S3 bucket (containing an <code>index.html</code> file) with the <code>ARC_STATIC_BUCKET</code> env var</li>
  <li>If using <code>arc.http.proxy</code>, pass in a valid config object</li>
</ul>
<a href="https://arc.codes/primitives/static" target="_blank">Learn more</a>`
  return httpError({ title, message })
}

function httpError ({ statusCode = 502, title = 'Unknown error', message = '' }) {
  title = title === 'Error'
    ? `${statusCode} error`
    : `${statusCode} error: ${title}`
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/html; charset=utf8;',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
    },
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    code {
      font-size: 1.25rem;
      color: #00c26e;
    }
    .max-width-320 {
      max-width: 20rem;
    }
    .margin-left-8 {
      margin-left: 0.5rem;
    }
    .margin-bottom-16 {
      margin-bottom: 1rem;
    }
    .margin-bottom-8 {
      margin-bottom: 0.5rem;
    }
    .padding-32 {
      padding: 2rem;
    }
    .padding-top-16 {
      padding-top: 1rem;
    }
    a, a:hover {
      color: #333;
    }
    p, li {
      padding-bottom: 0.5rem;
    }
  </style>
</head>
<body class="padding-32">
  <div>
    <div class="margin-left-8">
      <div class="margin-bottom-16">
        <h1 class="margin-bottom-16">
          ${title}
        </h1>
        <p>
          ${message}
        </p>
      </div>
      <div class="padding-top-16">
        <p>
          View Architect documentation at:
        </p>
        <a href="https://arc.codes">https://arc.codes</a>
      </div>
    </div>
  </div>
</body>
</html>
`
  }
}
