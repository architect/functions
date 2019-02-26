# Architect Functions changelog

## [2.0.1-2.0.11] - 2019-02-26

## Added

- proxy allows for configurable s3 bucket and folder
- proxied files now return `etag`
- `arc.proxy.public` configuration:
  - `spa` - boolean, load `index.html` at any folder depth
  - `ssr` - path string of module to load or function for overriding `/index.html`
  - `alias` - alias paths path (eg. `{'/css':'/styles/index.scss'}`)
  - `plugins` - per filetype transform plugin pipelines

The companion transform plugins aim to help developers make the transition to browser native esmodules:

- `@architect/proxy-plugin-jsx` transpiles jsx to preact/react
- `@architect/proxy-plugin-tsx` strips types and transpiles jsx to preact/react
- `@architect/proxy-plugin-mjs-urls` adds `/staging` or `/production` to imports urls
- `@architect/proxy-plugin-bare-imports` enable bare imports with browser esm

And for fun:

- `@architect/proxy-plugin-md` markdown to html
- `@architect/proxy-plugin-sass` sass/scss

> If you think we're missing a plugin please don't hesitate to ask in the issue tracker!

[Complete example project code here.](https://github.com/arc-repos/arc-example-proxy-plugins)

## [2.0.0] - 2019-02-03

### Removed

- arc.js
- arc.css
- arc.html
- arc.text
- arc.xml
- arc.json

---
## [1.13.0] - 2018-01-31

### Added

- New `arc.proxy` wip proxy get-index to /public when running locally and s3 when running on aws 

```javascript
// exmaple usage in a ws-connected lambda
let arc = require('@architect/functions')

exports.handler = arc.proxy.public() 
```
---
## [1.12.0] - 2018-01-16

### Added

- New `arc.ws` wip progress for sending web socket messages locally and in the cloud

```javascript
// exmaple usage in a ws-connected lambda
let WebSocket = require('@architect/functions').ws

exports.handler = async function WebSocketConnected(event) {
  let ws = new WebSocket(event)
  await ws.send('pong')
  return {
    statusCode: 200
  }
}
```

---
## [1.11.1] - 2018-12-15

### Added

- New `arc.middleware` await-based middleware API, see [the Architect Documentation](https://arc.codes/reference/middleware)
