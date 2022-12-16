import type { PublishResponse } from "@aws-sdk/client-sns";
import type { SendMessageResult } from "@aws-sdk/client-sqs";
import { Callback } from "./util";

// Turn off automatic exporting
export { };

interface Params<Payload> {
  name: string;
  payload: Payload;
}

// Consumers of this library should not care exactly what this is. Just that
// it's a lambda function which should be exported as a handler.
type LambdaFunction = unknown;

interface EventsOrQueues<PublishResult> {
  publish<Payload = any>(params: Params<Payload>): Promise<PublishResult>;
  publish<Payload = any>(
    params: Params<Payload>,
    callback: Callback<PublishResult>,
  ): void;
  subscribe<Event = any>(
    handler:
      | ((event: Event) => Promise<void>)
      | ((event: Event, callback: Callback<void>) => void),
  ): LambdaFunction;
}

export type ArcEvents = EventsOrQueues<PublishResponse>;
export type ArcQueues = EventsOrQueues<SendMessageResult>;
