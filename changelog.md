# Architect Functions changelog

---
Also see: [Architect changelog](https://github.com/architect/architect/blob/master/changelog.md)
---

## [3.5.5 - 3.5.6] 2019-10-25

### Fixes

- Fixes `arc.ws.send` for apps packaged with `@architect/package` **1.0.50** or later. AWS changed the `ApiGatewayMangementApi.postToConnection` interface paramter `endpoint` to no longer be suffixed with `@connections`
- Adds `data.reflect` to get table names 

```javascript
let arc = require('@architect/functions')

// elsewhere in your async function handler:
let data = await arc.tables()
let names = await data.reflect() // returns {arcfilename: 'generated-tablename'}
```

- Adds anti-caching and body parsing `application/vnd.api+json`; resolves #141, thanks @jkarsrud!

## [3.4.4] 2019-10-15

### Fixes

- Fixes broken response when bucket is not configured as root proxy


### Changed

- Improves error states for missing static configs, 404s, etc.

---

## [3.4.3] 2019-10-11

### Changed

- Updated dependencies

---

## [3.4.0 - 3.4.2] 2019-10-10

### Added

- Added support for `@static fingerprint true` in root spa / proxy requests
  - This enables Architect projects to deliver fully fingerprinted static assets while also ensuring that each file is appropriately cached by clients and network infra
  - Also includes support for build-free calls between your fingerprinted static assets
    - Example: in `public/index.html`, use the following syntax to automatically replace the local / human-friendly filename reference to the deployed fingerprinted filename:
    - `${arc.static('image.png')}` will be automatically replaced by `image-a1c3e5.png`
    - Or `${STATIC('image.png')}` (which is the same thing, but shoutier)
    - Note: although those look like JS template literal placeholders, they're intended to live inside non-executed, static files within `public/` (or `@static folder foo`)


### Changed

- Updated dependencies
- Changed static manifest loader to be more bundler friendly


### Fixed

- Fixed issue that may prevent `repl` from working with more recent versions of Functions
- Add anti-caching headers to `sandbox` 404 response

---

## [3.3.15] 2019-09-26

### Added

- Added more consistent and regular entry for proxy: `http.proxy`
  - This is non-breaking: `http.proxy.public`, `http.proxy.read`, and even the older `proxy.public` methods are still available, although are deprecated. We suggest moving to them.
  - `http.proxy` does the same as what `http.proxy.public` used to do; since the vast majority of use was around `http.proxy.public` and not `http.proxy.read`, it didn't make sense to have such a verbose method signature
- `http.proxy`'s SPA setting can now be disabled with an env var – `ARC_STATIC_SPA = 'false'` (where `false` is a string, not a bool)
  - You can still disable it via configuration as well (`{spa:false}`)
- Lots and lots of tests around `http.proxy`

### Fixed

- Better 404 / file missing handling in `sandbox` when using `http.proxy` (or loading static assets without `@http get /` specified)

---

## [3.3.14] 2019-09-25

### Changed

- Updated deps

### Fixed

- Restored `http.proxy.public` settings that were erroneously removed in a previous update
  - `bucket.staging`, `bucket.production`, `bucket.folder`, and `cacheControl` are now restored
- Fixes a proxy issue in Architect 5 / LTS projects where SPA requests for pages would not have loaded correctly

---

## [3.3.13] 2019-09-24

### Fixed

- Improved detection of `proxy` and `ws` when running locally with NODE_ENV not set to `testing`, and `ARC_LOCAL` set

---

## [3.3.12] 2019-09-13

### Fixed

- `http.proxy` now correctly responds to requests if your environment includes an `ARC_STATIC_FOLDER` env var

---

## [3.3.11] 2019-09-09

### Changed

- Internal change to normalize response shapes from `http.proxy.public` + `http.proxy.read`


### Fixed

- Fixes issue where binary assets delivered via `sandbox` / root may not be properly encoded
- Fixes issue where `http.proxy.public` + `http.proxy.read` may not have delivered correctly formatted responses in Architect 5
- Fixed minor issue in `ARC_HTTP` env var check

---

## [3.3.9 - 3.3.10] 2019-09-09

### Added

- Adds `ARC_HTTP` env var check to Arc v5 response formatter

---

## [3.3.8] 2019-09-03

### Fixed

- Fixes `arc.http` / `arc.http.async` responses to `/{proxy+}` requests

---

## [3.3.7] 2019-08-28

### Changed

- Makes passing config to `arc.http.proxy` entirely optional

---

## [3.3.5 - 3.3.6] 2019-08-27

### Added

- Added Architect 6 compatibility to `arc.http.async`, the new method name for `async/await` middleware
  - All `async/await` functions run through `arc.http.async` now automatically have client sessions attached and decoded, parsed bodes (if applicable)
  - Learn more about [upgrading to Arc 6 + `arc.http.async` here](https://arc.codes/guides/upgrade#arc-http-async)
- Added ability to set custom headers on any `arc.http.proxy` request


### Changed

- `arc.http.middleware` (formerly `arc.middleware`) is now `arc.http.async`
  - These methods are functionally the same
  - The old aliases will remain for a while to come, but we suggest moving any deprecated calls over to their new equivalents by mid-2020


### Fixed

- Fixed minor issue where status code of `302` couldn't be overridden when using both `location` and `statusCode` (or `status`, or `code`) response params
- Fixed bug preventing emitting binary assets via `arc.http.proxy`
- Fixed munged headers and content-type in proxy plugins, fixes @architect/architect#432


---

## [3.3.3 - 3.3.4] 2019-08-22

### Fixed

- Fixed `arc.static()` (and deprecated `arc.http.helpers.static()`) calls in Arc 6, fixes #59 /ht @mikemaccana
- Fixed sometimes-broken paths to API gateway

---

## [3.3.1 - 3.3.2] 2019-08-20

### Fixed

- Fixed `arc.tables()` calls in Arc 6

---

## [3.3.0] 2019-08-12

### Added

- Support for Architect 6
  - Includes complete compatibility for Architect 4 + 5 users:
    - If already using Functions, everything should just work!
    - If using Arc 5 dependency-free, you can now drop your existing responses into Architect Functions's `res()` and everything should be solid; no signature changes should be required
- Takes over all responsibilities of now-deprecated `@architect/data`
  - Previous data calls can be accessed with `arc.tables()`
- Responses now include the same content type aware `Cache-Control` defaults as found in Architect 5
  - As always, they're able to be overriden with `cacheControl` param (or `headers['Cache-Control']`)

### Changed

- Hopefully nothing breaking – please send feedback on the RC!
  - 3.3 RC: https://github.com/architect/functions/issues/57
  - Slack: https://architecture-as-text.slack.com

---

## [3.2.2] 2019-07-11

### Added

- Including a `headers` object in your `arc.http` response will now set custom headers
- `SESSION_DOMAIN` variable now supported in `jwe` sessions
- `context` is now passed onto each middleware function

---

## [3.2.1] 2019-06-26

### Changed

- Backwards-compatible refactoring of `events` publishing in preparation for Architect 6 service discovery

---

## [3.2.0] 2019-06-14

### Added

- For additional control of your user sessions, you may now define the [cookie Domain attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3)
  - Because this needs to be set consistently across your app's usage of session, set this via the `SESSION_DOMAIN` environment variable

---

## [3.1.0] 2019-06-05

### Added

- This release is all about improving static asset access!
  - Static asset fingerprinting is now built into the static asset helper!
    - Enable file fingerprinting in your project by adding `fingerprint true` to your Arc manifests's `@static` pramga
    - If enabled, requesting `styles.css` will return the proper fingerprinted URL (e.g. `https://your-bucket.s3.us-west-1.amazonaws.com/styles-1e25d663f6.css`)
  - The static asset helper is now a first-class method accessible at: `arc.static('filename.ext')`
    - File path are still relative to your `public/` dir
    - Legacy method `arc.http.helpers.static('filename.ext')` will continue to be supported
  - Static helper tests

---

## [3.0.8] 2019-05-20

### Fixed

- `proxy.read()` calls without `config.bucket` specified work correctly again, fixes #38

---

## [3.0.7] 2019-05-11

### Added

- `arc.http.helpers.static()` now uses `ARC_STATIC_BUCKET` and `ARC_STATIC_FOLDER` (as introduced in 2.0.16 for `arc.proxy.read()`), fixes #37

### Fixed

- Also improves S3 URL handling in `arc.http.helpers.static()`, partially addressing @architect/architect#375 (S3's late-2020 URL format support change)

### Changed

- Updated dependencies

---

## [3.0.6] 2019-05-09

### Added

- Adds support for sending `delaySeconds` parameter on queue publish, closes #36 /ht @bardbachmann

---

## [3.0.3 - 3.0.5] - 2019-04-19

### Added

- `arc.events.subscribe` will now accept an `AsyncFunction`

### Fixed

- Removes trailing slash from `arc.http.helpers.static()` that breaks URLs when working locally

### Changed

- Updated dependencies


---

## [3.0.2] - 2019-04-10

### Fixed

- Fixes local sandbox publishing events/queues bug introduced in 2.0.8

---

## [3.0.1] - 2019-04-04

### Added

- Enables both text and binary file transit in newly provisioned Arc apps
- This is NOT a breaking update if you aren't using `proxy.public()`
  - However, if you use `proxy.public()`, this is a breaking update!
  - In order to enable binary assets support, Arc Functions now encodes files being emitted via `proxy.public()` for use in Architect 5.6+ apps
  - If you'd like your existing app that uses `proxy.public()` to serve binary assets, you'll need to re-create your API (or hang tight until we release our forthcoming API migration tool)

### Fixed

- `get /` encoding is now properly set when using `config.bucket.folder`

---

## [2.0.17 - 2.0.19] - 2019-04-02

### Fixed

- Added checks to ensure bucket exists in `proxy.public()`
- Requests to unknown files via `proxy.public()` now return a proper 404 response, and not 200 / `undefined`
- Fixes proxy path prefix check in testing environment
- Found and removed some junk files in the NPM package

---

## [2.0.16] - 2019-03-27

### Added

- Adds `ARC_STATIC_BUCKET` + `ARC_STATIC_FOLDER` env vars for config-reduced `proxy.public()` reads

### Fixed

- In `proxy.public()` config, the bucket folder prefix is now respected when working locally

---

## [2.0.15] - 2019-03-13

### Added

- Cache-control header support for `proxy.public`; if not specified, defaults to:
  - HTML + JSON: `no-cache, no-store, must-revalidate, max-age=0, s-maxage=0`
  - Everything else: `max-age=86400`

### Changed

- Updated dependencies

---

## [2.0.13-14] - 2019-03-08

### Fixed

- Fixed local env check in `queues.publish` /ht @tobytailor

---

## [2.0.1-2.0.11] - 2019-02-26

### Added

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

---

## [2.0.0] - 2019-02-03

### Removed

- arc.js
- arc.css
- arc.html
- arc.text
- arc.xml
- arc.json

---

## [1.13.0] - 2019-01-31

### Added

- New `arc.proxy` wip proxy get-index to /public when running locally and s3 when running on aws

```javascript
// exmaple usage in a ws-connected lambda
let arc = require('@architect/functions')

exports.handler = arc.proxy.public()
```

---

## [1.12.0] - 2019-01-16

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
