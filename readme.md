<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/architect/assets.arc.codes/raw/main/public/architect-logo-light-500b%402x.png">
  <img alt="Architect Logo" src="https://github.com/architect/assets.arc.codes/raw/main/public/architect-logo-500b%402x.png">
</picture>

## [`@architect/functions`](https://www.npmjs.com/package/@architect/functions)

> Runtime helper library for serverless apps built with [Architect][npm]

[![GitHub CI status](https://github.com/architect/functions/workflows/Node%20CI/badge.svg)](https://github.com/architect/functions/actions?query=workflow%3A%22Node+CI%22)

Check out the full docs: [arc.codes](https://arc.codes)


## Install

`npm i @architect/functions`


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

**`@events` methods**
- [`events.subscribe()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.events.subscribe)
- [`events.publish()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.events.publish)

**`@http` methods**
- [`http()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.http)
- [`http.session()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.http.session)

**`@queues` methods**
- [`queues.subscribe()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.queues.subscribe)
- [`queues.publish()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.queues.publish)

**Service discovery**
- [`services()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.services)

**`@static` methods**
- [`static()`]([#static](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.static))

**`@tables` methods**
- [`tables()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.delete()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.get()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.put()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.query()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.scan()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.scanAll()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.update()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.reflect()`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table.name`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table._db`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)
  - [`table._doc`](https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.tables)

**`@ws` methods**
- [`ws.send()`](#https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws.send)
- [`ws.close()`](#https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws.close)
- [`ws.info()`](#https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws.info)
- [`ws._api`](#https://arc.codes/docs/en/reference/runtime-helpers/node.js#arc.ws.api)
