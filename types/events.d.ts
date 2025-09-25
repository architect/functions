import { Callback } from "./util";
import type { PublishResponse as SnsPublishResponse } from "@aws-lite/sns-types"
import type { SendMessageResponse as SqsPublishResponse } from "@aws-lite/sqs-types"

// Turn off automatic exporting
export { };

interface Params<Payload> {
  name: string;
  payload: Payload;
}

interface EventsOrQueues<PublishResult> {
  publish<Payload = any>(params: Params<Payload>): Promise<PublishResult>;
  publish<Payload = any>(
    params: Params<Payload>,
    callback: Callback<PublishResult>,
  ): void;
  subscribe<Event = any>(handler: (e: Event) => Promise<void>): (e: Event) => Promise<void>;
  subscribe<Event = any>(handler: (e: Event, callback: Function) => void): (e: Event, context: any, callback: Function) => void;
}

export type ArcEvents = EventsOrQueues<SnsPublishResponse>;
export type ArcQueues = EventsOrQueues<SqsPublishResponse>;
