import { SNS, SQS } from "aws-sdk";

// Turn off automatic exporting
export {};

interface Params<Payload> {
  name: string;
  payload: Payload;
}

type Callback<Res> = (err: Error, res: Res) => void;

// Consumers of this library should not care exactly what this is. Just that
// it's a lambda function which should be exported as a handler.
type LambdaFunction = unknown;

interface EventsOrQueues<PublishResult> {
  publish<Payload = any>(params: Params<Payload>): Promise<PublishResult>;
  publish<Payload = any>(
    params: Params<Payload>,
    callback: Callback<PublishResult>
  ): void;

  subscribe<Event = any>(
    handler:
      | ((event: Event) => Promise<void>)
      | ((event: Event, callback: Callback<void>) => void)
  ): LambdaFunction;
}

export type Events = EventsOrQueues<SNS.Types.PublishResponse>;
export type Queues = EventsOrQueues<SQS.Types.SendMessageResult>;
