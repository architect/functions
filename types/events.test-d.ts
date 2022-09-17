import arc from "../";

interface Payload {
  some: string;
}

const event = { name: "some-name", payload: { some: "stuff" } };

async function eventPublishing() {
  // $ExpectError
  arc.events.publish({});

  // $ExpectError
  arc.events.publish<Payload>({ name: "bad", payload: {} });

  // Full type is: SNS.Types.PublishResponse
  // $ExpectType PublishResponse
  await arc.events.publish(event);

  arc.events.publish(event, (err, res) => {
    // $ExpectType Error
    err;

    // $ExpectType PublishResponse
    res;
  });
}

function eventSubscribing() {
  arc.events.subscribe(async (event: any) => {
    // $ExpectType any
    event;
  });

  // $ExpectError
  arc.events.subscribe<Payload>(async (event: number) => { });

  arc.events.subscribe<Payload>(async (event: Payload) => {
    // $ExpectType Payload
    event;
  });

  arc.events.subscribe<Payload>(async (event: Payload, callback) => {
    // $ExpectType Payload
    event;
    // $ExpectType Callback<void>
    callback;
  });
}

async function queuePublishing() {
  // $ExpectError
  arc.queues.publish({});

  // $ExpectError
  arc.queues.publish<Payload>({ name: "bad", payload: {} });

  // Full type is: SQS.Types.SendMessageResult
  // $ExpectType SendMessageResult
  await arc.queues.publish(event);

  arc.queues.publish(event, (err, res) => {
    // $ExpectType Error
    err;

    // $ExpectType SendMessageResult
    res;
  });
}

function queueSubscribing() {
  arc.queues.subscribe(async (event: any) => {
    // $ExpectType any
    event;
  });

  // $ExpectError
  arc.queues.subscribe<Payload>(async (event: number) => { });

  arc.queues.subscribe<Payload>(async (event: Payload) => {
    // $ExpectType Payload
    event;
  });

  arc.queues.subscribe<Payload>(async (event: Payload, callback) => {
    // $ExpectType Payload
    event;
    // $ExpectType Callback<void>
    callback;
  });
}
