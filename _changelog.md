# Architect Functions changelog

---

Also see: [Architect changelog](https://github.com/architect/architect/blob/main/changelog.md)

---

## [8.1.2] 2024-05-14

### Changed

- Updated dependencies

---

## [8.1.1] 2024-04-29

### Changed

- Updated dependencies
- Updated `package.json` `engines.node` property to reflect changes from v8

---

## [8.1.0] 2024-03-07

### Added

- Added support for passing `arc.tables({ awsjsonMarshall, awsjsonUnmarshall })` options, learn more at:
  - https://github.com/architect/aws-lite/issues/111
  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-util-dynamodb/Interface/marshallOptions/
  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-util-dynamodb/Interface/unmarshallOptions/


### Changed

- Fixed potential issue where parsing SQS errors may fail
- Updated dependencies

---

## [8.0.3] 2024-02-09

### Fixed

- Fixed output of `tables.put()` to return the updated item, as in versions <=7; fixes #554

---

## [8.0.0 - 8.0.2] 2024-02-03

Architect Functions just got a lot faster. Gone are the days of 500-1000ms cold starts due to instantiating the AWS SDK – Functions v8 is now between 2-5x faster, and uses 2-4x less memory, courtesy of [aws-lite](https://aws-lite.org)!


### Added

- `arc.tables()` now includes a new DynamoDB client: `_client`, an instantiation of [`@aws-lite/dynamodb`](https://github.com/architect/aws-lite/tree/main/plugins/dynamodb)
  - `_client` is largely functionally similar to the AWS SDK's DocumentClient, but a bit less fiddly (we think)
  - `arc.tables()` methods should be functionally the same, including key error properties


### Changed

- Breaking change: AWS SDK v2 + v3 DynamoDB client + DocumentClient instantiation is now opt-in
  - Code depending on `data._db` or `data._doc` must now instantiate with the `awsSdkClient` boolean option, like so: `await arc.tables({ awsSdkClient: true })`
  - If you only rely on the DocumentClient (`_doc`), you may want to just try using the new [`@aws-lite/dynamodb`](https://aws-lite.org/services/dynamodb)-based `_client`
- Breaking change: while we've taken efforts to ensure the maximum degree of compatibility with AWS SDK v2 and v3 errors, the errors returned in Arc Functions 8.0 (using `aws-lite`) may still vary slightly
  - This only really applies if your error handling relies on specific properties or values
  - If you just `console.log()` your errors, you will be totally fine, and the quality of the errors you get via `aws-lite` will most likely improve with this change
  - Note: if you're an AWS SDK v2 user considering migrating to v3, error incompatibility will apply even more so; v3 errors are incompatible with v2, whereas `aws-lite` errors attempt to be compatible with both SDK v2 + v3
- Added Node.js 20.x to test matrix
- Breaking change: removed support for Node.js 14.x (now EOL, and no longer available to created in AWS Lambda)

---

## [7.0.0] 2023-07-10

### Added

- Added support for `arc.http` to accept either async or callback functions
  - This is not a breaking change, and `arc.http.async` will remain as a legacy code path
  - Moving forward we suggest passing all middleware through `arc.http`, which will figure out whether to run in async or callback mode
  - Note: pass only callback or async middleware, but not both. Don't drink and drive, and don't mix async primitives.
- Added service discovery for DynamoDB-backed sessions
  - Now you can set your `ARC_SESSION_TABLE_NAME` env var with the logical name of your sessions table found in your `app.arc` file
  - However, the physical DynamoDB table name will work as well
- Added support for JWE session encryption customization
  - Configure by adding an env var named `ARC_APP_SECRET_ALGO` with a value of `A256GCM` (default if not specified), `A192GCM`, or `A128GCM`
- Added `tables.scanAll` method for retrieving the entire contents of a table


### Changed

- Improved SNS (`@events`), SQS (`@queues`), and SSM (`arc.discovery`) performance by caching clients, thereby enabling more efficient usage, especially in large workloads; thanks @w5mix & @CameronSima!
- Breaking change: default JWE session encryption algorithm is now `A256GCM`
  - This algorithm offers greater entropy with as good or greater performance in session token encryption / decryption
  - Backwards compatible JWE session encryption is available by adding a truthy env var named `ARC_FORCE_LEGACY_JWE_SECRET`
- Invalid session secrets now error loudly
- Updated deps


### Fixed

- Fixed http session issue where custom JWE secrets were not properly encoded when encrypting the web token
  - This is not a CVE or security issue, just a simple compatibility bug
  - However, this bug fix effectively invalidates any outstanding Arc-issued JWE session cookies; if you want to postpone this token fix until a later time, add a truthy env var named `ARC_FORCE_LEGACY_JWE_SECRET`

---

## [6.0.1] 2023-06-06

### Changed

- Updated deps


### Fixed

- Fixed issue where `arc.tables` on Node.js 18+ (i.e. AWS SDK v3) would keep Sandbox Dynamo connections open for 5s

---

## [6.0.0] 2023-04-05

### Added

- Added anti-caching to `{ location }` responses


### Changed

- AWS has deprecated Lambda `nodejs12.x`; `@architect/functions` 6.0 now assumes `nodejs14.x` or higher
- The `location` property now sets an HTTP 2 compliant lowcase `location` header, instead of the previous `Location` header
- Updated AWS SDK versions to sync up with the rest of Architect following v10.12

---

## [5.4.0 - 5.4.1] 2023-02-26

### Added

- Added `compression` response property for unencoded, non-binary responses; fixes #543
  - Default is (still) `br`, and it can be set to `gzip` or disabled with `false`
  - Compression is still best-effort; if the client does not support the default or specified compression, no compression is used


### Changed

- Updated dependencies

---

## [5.3.4] 2023-02-13

### Changed

- Updated dependencies


### Fixed

- Fixed broken predicates for using `useAWS` preference or `ARC_LOCAL` env var to connect to DynamoDB, SNS, and SQS; thanks @w5mix!

---

## [5.3.3] 2022-12-14

### Changed

- Minor performance improvement to `arc.http` binary content type checks; thanks @gyx1000!

---

## [5.3.2] 2022-12-12

### Changed

- Updated `binaryTypes` array, thanks @MichaelDeBoey!

---

## [5.3.1] 2022-11-30

### Fixed

- Fixed issue where users without the AWS-SDK installed locally or globally would error if `@architect/functions` is required or imported

---

## [5.3.0] 2022-11-24

### Added

- Added support for Lambda's new `nodejs18.x` runtime, and AWS SDK v3 (`@aws-sdk/*`)
  - If your Lambdas make use of `@architect/functions` (and you otherwise do not directly rely on AWS SDK calls), you are now likely fully forward-compatible with `nodejs18.x` (see caveats below)
  - However, if your Lambdas do NOT make use of `@architect/functions`, before opting into Lambda `nodejs18.x` + SDK v3 we strongly advise you read: https://arc.codes/aws-sdk-versions
  - To opt in, simply upgrade `@architect/architect` to 10.8 and change your `@aws runtime` setting to `nodejs18.x` (learn more at http://arc.codes/docs/en/reference/project-manifest/aws#runtime)
- Added Node.js 18.x to test coverage


### Changed

- Due to changes in AWS SDK v2 → v3, `arc.tables()._db` + `arc.tables()._doc` methods are now slightly different; unfortunately, this is not something `@architect/functions` can paper over; [see more here](https://arc.codes/docs/en/reference/runtime-helpers/node.js#client-methods)
- In order to paper over breaking changes in AWS SDK v2 to v3, `@architect/functions` inspect the running Node.js version to follow different code paths to corresponding SDK versions; if your test / CI environment is not using the same Node.js version as your production environment, this may result in unexpected testing issues
  - For example: your CI environment runs Node.js 18.x, but your Lambda uses `@architect/functions` >= 5.3 and is configured to use 16.x; some methods deep within the SDK may differ, and your tests may break
  - Unless you are making use of `arc.tables()._db` + `arc.tables()._doc`, we think this scenario is pretty unlikely. That said, this is unfortunately not something Architect can control for or prevent, and ultimately falls to AWS to resolve for developers
  - We can only **strongly advise your CI and production environments use the same version of Node.js**
- Updated dependencies

---

## [5.2.3] 2022-10-14

### Changed

- Updated dependencies


### Fixed

- Fixed double-encoding issue for `arc.http[async]` responses that are already base64-encoded

---

## [5.2.2] 2022-09-07

### Changed

- Updated dependencies


### Fixed

- `ws._api` no longer needs to be initialized by running a WebSocket function

---

## [5.2.1] 2022-06-29

### Fixed

- Return type from ArcTable.get is Promise<Item | undefined>

---

## [5.2.0] 2022-06-29

### Added

- Bundled typings for public API, thanks @camjackson
  - tested with `dtslint` in a new GitHub workflow

---

## [5.1.0] 2022-04-08

### Added

- Added automatic brotli (`br`) compression to HTTP API responses; compression will not be applied if any of the following cases are true:
  - You specify a `content-encoding` header
  - The requesting client does not request `br` encoding via the `accept-encoding` header
  - You return anything other than a buffer or string as the body of your response
  - You are using a legacy REST API

---

## [5.0.5] 2022-04-05

### Fixed

- Fixed body parsing issue that impacts performance of large request body payloads

---

## [5.0.4] 2022-02-24

### Changed

- Deep require `aws-sdk` deps for a potentially large cold start perf boost
  - In small-scale testing, we found this can further reduce cold start performance by 2.5-5x, averaging ~150ms on Lambda


### Fixed

- Fixed usage with custom stack names; fixes #1322, thanks @Lugana707, @pgte

---

## [5.0.3] 2022-02-24

### Added

- Enable Functions v5 to be used as a bare module in test suites without setting env vars (see `ARC_ENV` requirement below)
  - Functions now makes a best-effort attempt to find Sandbox ports via internal SSM


### Changed

- Relax requirement for `ARC_ENV` env var; backfill it to `testing` if not found

---

## [5.0.0 - 5.0.2] 2022-01-18

### Added

- `@architect/functions` is faster and leaner than ever, now down to about 425KB (from ~950KB). This means even faster cold starts and overall performance!
- Added support for Sandbox dynamic port selection
- Added `rawBody` property, handy for use with external libraries that may need access to the raw body contents for things like signing
  - Moving forward, Arc Functions consumers should consider the `isBase64Encoded` property to correspond only to `rawBody`, and to be unrelated to the `body` property
  - See also: the change below re. base64 decoding of `text/plain` + `*/xml` bodies


### Changed

- Breaking change: Architect no longer automatically populates, relies on, or makes direct use of `NODE_ENV` or `ARC_CLOUDFORMATION` env vars. `@architect/functions` v5+ now requires Architect v10 / Sandbox v5 or later.
  - Added top-level check for correct minimum version, fixes #1313; thanks @monkbroc!
- Breaking change: removed support for legacy Sandbox `@ws` internals, requiring Sandbox v5
- Breaking change: removed `http.express` method, which was badly out of date and broadly unused
  - Before this change, `@architect/functions` had 19 dependencies and weighed in at ~950KB; after it has 12 dependencies (down 7), and weighs about 475KB, for about a 50% reduction!
- Breaking change: removed deprecated methods:
  - `arc.http.middleware` (deprecated August 2019) is now `arc.http.async`
  - `arc.http.helpers.static` (deprecated June 2019) is now `arc.static`
- Breaking change: removed `arc.tables.doc` + `arc.tables.db` methods
  - These methods are still available after table instantiation like so: `let { _doc, _db} = await arc.tables()`
  - This change enables Architect Functions to only load `aws-sdk` when absolutely necessary, making it 20-30x faster to run in Lambda for usage that does not rely on DynamoDB
- Stop publishing to the GitHub Package registry
- Added checks to ensure there are no mysterious failures when required env vars are not present
- Preference for `ARC_*` namespaced env vars:
  - `ARC_SESSION_TABLE_NAME` > `SESSION_TABLE_NAME`
  - `ARC_SESSION_TTL` > `SESSION_TTL`
  - `ARC_SESSION_DOMAIN` > `SESSION_DOMAIN`
  - All non-namespaced names will continue to be supported until at least Architect 11; we suggest changing them over to the namespaced equivalents as soon as is convenient

---

## [4.1.2] 2022-02-07

### Changed

- Architect Functions now fails gracefully in Architect 10+ / Sandbox 5+
- Base 64 decodes `text/plain`, `text/xml` and `application/xml` payloads based off `Content-Type`

---

## [4.1.1] 2021-11-22

- Fix crash on missing `ARC_WSS_URL` env var when `@ws` is defined in a project

---

## [4.1.0] 2021-11-20

- Added `ws.close` and `ws.info` to close a WebSocket and get connection info. Requires `@architect/sandbox@4.3.0` or higher.
- Added `ws._api` a preconfigured `ApiGatewayManagementApi` instance. Requires `@architect/sandbox@4.3.0` or higher.
- `ws.send` now leverages `ws._api` and falls back to the old version of send in older Sandbox environments

---

## [4.0.0] 2021-07-25

### Added

- Enable `tables.scan()` to be used without passing any arguments


### Changed

- Breaking change: `arc.http.proxy` is now `@architect/asap`!
  - ASAP is now fully independent of `@architect/functions` as of version `4.0.0` of both packages
    - With some minor exceptions, ASAP is a drop-in replacement for `arc.http.proxy` calls and usage - no fuss, no muss!
    - ASAP is also a faster, leaner implementation (-70% smaller, with zero dependencies)
  - `@architect/functions` is now significantly (~25%) lighter:
    - `@architect/functions` 3.x (with deps): ~1.1MB
    - `@architect/functions` 4.x (with deps): ~760KB
  - All legacy `@architect/functions` `proxy` calls are now removed from this package; this includes: `arc.http.proxy`, `arc.http.proxy.public`, `arc.http.proxy.read`, `arc.proxy.public`
    - Again, just aim those same calls at `@architect/asap` and things should just work - and if they do not, please let us know!
- Breaking change: removed support for Node.js 10.x (now EOL, and no longer available to created in AWS Lambda)
- Breaking change: removed support for handling requests from Architect 5 (and lower) APIs
  - Responding to requests has not changed, however! Old response semantics from Architect 5 (and lower) will continue to be supported, so you'll always have a clear, clean upgrade path from older Architect projects to newer APIs
- Normalized headers to lowercase for full HTTP 2 compatibility
- Updated dependencies

---

## [3.14.1] 2021-05-25

### Fixed

- Fixed an issue in sandbox where table names containing other table names would
    get the table definitions confused; thanks @reconbot!

---

## [3.14.0] 2021-05-24

### Added

- New `arc.services()` API for retrieving the service map object for a given app; this object contains metadata associated with all infrastructure or services leveraged by the app

---

## [3.13.12] 2021-05-24

### Changed

- Removed unnecessary console logging for `@events` + `@queues` publishing

---

## [3.13.11] 2021-04-15

### Fixed

- Restored `req.path` convenience parameter missing from HTTP APIs; thanks @crtr0!

---

## [3.13.10] 2021-04-07

### Added

- Session cookie's SameSite value is configurable with ARC_SESSION_SAME_SITE environment variable; thanks @activescott!
- Fixed issue with `arc.tables()` not generating a client for tables with the string `production` in their names in a Sandbox context

---

## [3.13.9] 2021-01-13

### Added

- Added new alias for `arc.tables()._name` to `arc.tables().name`


### Fixed

- Fixed `arc.tables()._name` Sandbox mode returning an array instead of a string; thanks @exalted!

---

## [3.13.8] 2020-11-12

### Changed

- Internal change for JWE token issuance, thanks @lpetre!
- Ensure JWE session helper also uses the ordered last of multiple potential client sessions present in a cookie (if multiple are present)

---

## [3.13.7] 2020-11-05

### Changed

- Sessions helper now uses the ordered last of multiple potential client sessions present in a cookie (if multiple are present)


### Fixed

- Fixed subtle session bug where attempting to clear a session would retain old session data
- Fixed broken legacy `cookie` response param behavior, restoring behavior of being an alias for setting a `set-cookie` header, and not for writing a session

---

## [3.13.6] 2020-11-04

### Fixed

- Fixed rate-limit crashes in legacy `events.publish` call; fixes #300

---

## [3.13.5] 2020-11-03

### Changed

- Updated session test to no longer use legacy session table name
- Updated dependencies


### Fixed

- Handle body parsing `HTTP` APIs with v2.0 Lambda req payloads that include raw JSON; fixes @architect#997, thanks @mawdesley!

---

## [3.13.4] 2020-10-24

### Fixed

- Return errors on local `@events` + `@queues` publishing

---

## [3.13.3] 2020-09-23

### Fixed

- Fixes backward compat for legacy old school tidy Arc response params (e.g. `{ location: '/foo' }`) when used in `HTTP` APIs

---

## [3.13.2] 2020-09-21

### Fixed

- Fixes backward compat for legacy super old school content-type based responses (e.g. `{ html: 'foo' }`) when used in `HTTP` APIs

---

## [3.13.1] 2020-09-16

### Fixed

- Fixed bad call in `http.proxy` alias config

---

## [3.13.0] 2020-09-10

### Added

- Added full forwards compatibility for API Gateway HTTP APIs, including the new v2.0 payload
  - HTTP APIs in v2.0 have undocumented support for some funky response formats, so when in v2.0 mode, non-standard responses are passed through with minimal or no mutation
- Added support for passing along `multiValueHeaders` in responses

---

## [3.12.3] 2020-07-29

### Added

- Enable proxy to use HTTP APIs running in Lambda v1.0 payload format mode

---

## [3.12.2] 2020-07-20

### Added

- Adds support for loading compressed files out of proxy

---

## [3.12.1] 2020-06-16

### Fixed

- Fixed proxy lookup to custom 404 page working locally
- Fixed incorrect filename in proxy 404 error message

---

## [3.12.0] 2020-06-15

### Added

- Adds automatic fingerprint upgrading from non-fingerprinted requests; example:
  - If `@static fingerprint true` is enabled, `<img src=this-is-fine.gif>` will now automatically load `/_static/this-is-fine-abc123.gif`

---

## [3.11.0] 2020-06-07

### Added

- Adds fingerprinting support for pretty URLs and custom 404s in proxy
- Adds support for `ARC_STATIC_PREFIX` env var to provide symmetry with the new `@static prefix` setting
  - The `ARC_STATIC_FOLDER` env var is now considered deprecated, and will be removed in a future (breaking) release
- Added support for leading slashes in build-free templating (e.g. `${arc.static('/this-is-fine.gif')}`)


### Fixed

- Ensures the build-free templating engine always runs, not just when fingerprint is enabled

---

## [3.10.0 - 3.10.1] 2020-05-17

### Added

- Improved default caching behavior for static assets; fixes #273
  - Any assets that don't have `cache-control` explicitly set will now default to using `ETag` in order to improve the reliability of cache invalidation
  - HTML & JSON responses still default to anti-caching headers
- Added path peeking (aka pretty URLs); fixes #269
  - URLs delivered via `proxy` no longer require a trailing slash!
  - Example: to load `/foo/index.html`, you used to have to request `/foo/`
  - Now, if `/foo` is requested, `proxy` will automatically try peeking into `/foo` to see if it contains `/foo/index.html` – if not, it'll 404 as expected
- Added ETag support to Sandbox static asset serving
- Added support for arbitrary static asset config mapping
  - Pass proxy `config.assets` a `static.json`-like static asset object


### Changed

- Internal refactoring: cleaned up old `proxy` code paths


### Fixed

- We now ensure CDNs cannot cache `404` responses

---


## [3.9.1 - 3.9.3] 2020-05-06 - 2020-05-07

### Fixed

- `arc.http.express` POST request could fail if `req.body` was null

---

## [3.9.0] 2020-04-27

### Fixed

- `arc.http.express` POST request could fail if `req.body` was null


### Added

- Adds S3 `ContentEncoding` for `arc.http.proxy` / `arc.http.proxy.read`
  - This means you can now publish and read larger files out of S3 in the compressed format of your choosing!


### Changed

- Updated dependencies


---

## [3.8.3 - 3.8.4] 2020-04-16

### Fixed

- Fixed `arc.http.helpers.url` to now respect `ARC_LOCAL` flag, thanks @filmaj!
- Fixed `arc.tables._name` calls, thanks @filmaj!

---

## [3.8.2] 2020-04-19

### Fixed

- Support for Lambda payload version 2 in session (for API Gateway HTTP APIs)

---

## [3.8.1] 2020-03-24

### Fixed

- Mocks API Gateway's current behavior of not sending a body when response is headers / status code only; fixes #254, /ht @alexbepple
  - (Back in the day it used to default to sending `\n` because reasons.)
- Fixed and improved events.subscribe fallback object (handy for local testing)
- Fixed local predicate for `arc.tables` to ensure `ARC_LOCAL` can speak to live AWS infra

---

## [3.7.7 - 3.8.0] 2020-03-12

### Fixed

- Calling `static()` with the root path (e.g. `static('/')`) now returns `/_static/`; thanks Paul!
- `arc.http.proxy` now supports API Gateway HTTP APIs request/response payload V2

---

## [3.7.5 - 3.7.6] 2020-02-13

### Changed

- Functions now ensures `NODE_ENV` is one of `testing`, `staging`, or `production` (defaulting to `testing`)
- Updated dependencies
- Fix for `arc.tables()` returning `undefined`
- Updates deps


### Fixed

- Improves reliability of using Architect Functions in certain test harnesses that may automatically set `NODE_ENV`

---

## [3.7.2 - 3.7.4] 2020-02-12

### Fixed

- Refactor of internal DynamoDB client instantiation; resolves issues using Functions with some test harnesses (like Jest); fixes #238, thanks @konsumer!
- Fixes issue that caused Sandbox to stall when called via the Architect CLI
- Fixes issue that caused Architect Functions to cause issues in certain test harnesses that may automatically set `NODE_ENV`
- Note: `3.7.1` was an erroneous re-publish of `3.7.0`, please use `3.7.2`

---

## [3.7.0] 2020-02-10

### Added

- Added support for porting express apps with `arc.http.express`

---
## [3.6.0] 2020-02-03

### Added
- Added support for running multiple Sandboxes at the same time
  - No more conflicting events and ports when running multiple simultaneous local Architect projects!
  - Also, you can now manually configure your `@events` port with `ARC_EVENTS_PORT`, and `@tables` port with `ARC_TABLES_PORT`

---

## [3.5.1] 2020-02-02

### Added

- Added fallback event object for direct invocation of event functions using `arc.events.subscribe`


### Changed

- Updated tests for Sandbox soon to be setting `ARC_CLOUDFORMATION` env var
- Updated dependencies

---

## [3.5.0] 2020-01-24

### Added

- `arc.queues.publish` can now accept `groupID` for fifo queues
- erase session with `return {session: {}, location: '/'}` syntax

---

## [3.4.14] 2019-12-13

### Changed

- Allow setting session TTL by passing a SESSION_TTL environment variable with the desired TTL in seconds
- Removes `@architect/parser` dep

## [3.4.13] 2019-12-10

### Changed

- Internal change for JWE token issuance


### Fixed

- Local WebSockets (`arc.ws`) calls no longer always send port `3333`, and to now support custom ports

---

## [3.4.12] 2019-12-01

### Changed

- Uses updated `ARC_WSS_URL` env var format (but retains backwards compatibility)

---

## [3.4.11] 2019-11-28

### Added

- Adds `stagePath` option to `arc.static` for anyone using this with a bare API Gateway configuration
  - Example: `arc.static('foo.png', {stagePath: true})`


### Changed

- `arc.static` now throws an error if the specified asset is not found
- Updated dependencies

---

## [3.4.9 - 3.4.10] 2019-11-28

### Changed

- Updated dependencies


### Fixed

- Fixes issue where `events.publish` may sometimes fail with > 10 topics; thanks @dduran1967!

---

## [3.5.8] 2019-11-04

### Changed

- Internal / testing changes only

---

## [3.5.7] 2019-11-01

### Added

- `arc.http.proxy` looks for default `index.html` when `ARC_STATIC_SPA=false`

---

## [3.5.5 - 3.5.6] 2019-10-25

### Fixed

- Fixes `arc.ws.send` for apps packaged with `@architect/package` **1.0.50** or later. AWS changed the `ApiGatewayMangementApi.postToConnection` interface paramter `endpoint` to no longer be suffixed with `@connections`
- Adds `data.reflect` to get table names

```javascript
let arc = require('@architect/functions')

// elsewhere in your async function handler:
let data = await arc.tables()
let names = await data.reflect() // returns {arcfilename: 'generated-tablename'}
```

- Adds anti-caching and body parsing `application/vnd.api+json`; resolves #141, thanks @jkarsrud!

---

## [3.4.4] 2019-10-15

### Fixed

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
