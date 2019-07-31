## [`@architect/functions`][npm] [![Travis Build Status](https://travis-ci.com/architect/functions.svg?branch=master)](https://travis-ci.com/architect/functions) [![Appveyor Build Status](https://ci.appveyor.com/api/projects/status/k1ct9sv8xv9pbgg2/branch/master?svg=true)](https://ci.appveyor.com/project/ArchitectCI/functions/branch/master) [![codecov](https://codecov.io/gh/architect/functions/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/functions)

> Helper library for serverless apps built with [Architect][npm]

Check out the full docs: [arc.codes](https://arc.codes)

# API

Given:

    let arc = require('@architect/functions')

The following APIs exists:

## `arc.events.subscribe(fn)`

Used to define a lambda function that will act as an event handler. Event
handlers are defined in your application's `.arc` file under the
[`@events`][events] pragma. The function code for the accompanying handler to
each event should use `arc.events.subscribe` to wrap the handler. For example,
given the following `.arc` file snippet:

```
@events
concerts
```

... the following file will be initialized representing the event handler for
the `concerts` event, wherein you need to use `arc.events.subscribe`:

```
// file: src/events/concerts/index.js
let arc = require('@architect/functions')
module.exports = arc.events.subscribe(function(payload, callback) {
  console.log(payload)
  callback()
})
```

## `arc.events.publish(params, callback)`

Publishes `params.payload` to the SNS Topic with name `params.name`. When
running in local/testing mode, will publish the event to the [sandbox][sandbox].

[npm]: https://www.npmjs.com/package/@architect/functions
[sandbox]: https://www.npmjs.com/package/@architect/sandbox
[events]: https://arc.codes/reference/events
