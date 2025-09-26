<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/architect/assets.arc.codes/raw/main/public/architect-logo-light-500b%402x.png">
  <img alt="Architect Logo" src="https://github.com/architect/assets.arc.codes/raw/main/public/architect-logo-500b%402x.png">
</picture>

## [`@architect/functions`](https://www.npmjs.com/package/@architect/functions)

> Runtime utility library for [Functional Web Apps (FWAs)](https://fwa.dev/) built with [Architect][https://arc.codes]

[![GitHub CI status](https://github.com/architect/functions/workflows/Node%20CI/badge.svg)](https://github.com/architect/functions/actions?query=workflow%3A%22Node+CI%22)

Check out the full docs for [this library](https://arc.codes/docs/en/reference/runtime-helpers/node.js) and [Architect](https://arc.codes)


## Development

### Testing

This project uses Node.js native test runner (Node.js 20+) for testing. The test suite includes both unit and integration tests.

**Run all tests:**
```bash
npm test
```

**Run specific test types:**
```bash
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:types       # TypeScript type tests
```

**Generate coverage reports:**
```bash
npm run coverage         # Coverage with lcov output
npm run coverage:text    # Coverage with text output only
npm run coverage:all     # Coverage for all tests (unit + integration)
```

The test suite uses Node.js built-in test runner and assert module. Coverage reporting is handled by Node.js native coverage collection (`--experimental-test-coverage`).


## Install

Within your Architect project directory, add `@architect/function` to its root `package.json`:

`npm i @architect/functions`

> You may also add `@architect/function` to individual Lambda `package.json` files, but we suggest making use of Architect's automated Lambda treeshaking. See the [Architect dependency management guide](https://staging.arc.codes/docs/en/guides/developer-experience/dependency-management#node.js) for more details.


## Usage

```js
let {
  events,   // @events pub/sub
  http,     // @http middleware + tools
  queues,   // @queues pub/sub
  services, // Architect resource / service discovery
  static,   // @static asset helper
  tables,   // @tables DynamoDB helper methods + API client
  ws,       // @ws WebSocket helper + API client
} = require('@architect/functions')
```


# API

**[`@events` methods](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.events)**
- [`events.subscribe()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.events.subscribe())
- [`events.publish()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.events.publish())

**[`@http` methods](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.http)**
- [`http()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.http)
- [`http` middleware](https://arc.codes/docs/en/reference/runtime-helpers/node.js#middleware)
- [`http.session`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.http.session)
- [`http.csrf`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.http.csrf)

**[`@queues` methods](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.queues)**
- [`queues.subscribe()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.queues.subscribe())
- [`queues.publish()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.queues.publish())

**Service discovery**
- [`services()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.services())

**[`@static`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.static())**
- [`static()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.static())

**[`@tables` methods](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables())**
- [`tables()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables())
  - [`table.delete()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#instance-methods)
  - [`table.get()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#instance-methods)
  - [`table.put()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#instance-methods)
  - [`table.query()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#instance-methods)
  - [`table.scan()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#instance-methods)
  - [`table.scanAll()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#instance-methods)
  - [`table.update()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#instance-methods)
  - [`table._db`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#client-methods)
  - [`table._doc`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#client-methods)
  - [`table.name`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#client-methods)
  - [`table.reflect()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#client-methods)

**[`@ws` methods](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws)**
- [`ws.send()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws.send())
- [`ws.close()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws.close())
- [`ws.info()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws.info())
- [`ws._api`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws._api())
