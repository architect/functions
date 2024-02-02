import { Callback } from "./util";
import type { PublishResponse as SnsPublishResponse } from "@aws-lite/sns-types"
import type { SendMessageResponse as SqsPublishResponse } from "@aws-lite/sqs-types"

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

export type ArcEvents = EventsOrQueues<SnsPublishResponse>;
export type ArcQueues = EventsOrQueues<SqsPublishResponse>;
