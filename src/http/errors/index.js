/**
 * HTTP error response generator and template
 */
module.exports = function httpError (params) {
  let {
    statusCode = 502,
    title = 'Unknown error',
    message = '',
  } = params
  title = title === 'Error'
    ? `${statusCode} error`
    : `${statusCode} error: ${title}`
  return {
    statusCode,
    headers: {
      'content-type': 'text/html; charset=utf8;',
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
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
`,
  }
}
