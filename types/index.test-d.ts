import type { AwsLiteClient } from "@aws-lite/client"
import type { GetConnectionResponse } from "@aws-lite/apigatewaymanagementapi-types";
import type { QueryResponse, ScanResponse, UpdateItemResponse } from "@aws-lite/dynamodb-types"
import type { PublishResponse } from "@aws-lite/sns-types"
import type { SendMessageResponse } from "@aws-lite/sqs-types"
import type { Context } from "aws-lambda";
import { expectType, expectAssignable, expectNotAssignable } from "tsd";
import arc from "../";
import type { HttpHandler, HttpAsyncHandler } from "../"
import type { HttpMethods, HttpRequest, HttpResponse } from "./http";

// EVENTS
const eventsPublishArg = { name: "test", payload: { foo: "bar" } };
const eventsPublishResult = await arc.events.publish(eventsPublishArg);
expectType<PublishResponse>(eventsPublishResult);

// QUEUES
const queuesPublishArg = { name: "test", payload: { foo: "bar" } };
const queuesPublishResult = await arc.queues.publish(queuesPublishArg);
expectType<SendMessageResponse>(queuesPublishResult);

// HTTP
const middleware: HttpHandler = (req, res, next) => {
  expectType<HttpRequest>(req);
  expectType<(p: HttpResponse | Error) => void>(res);
  expectType<() => void>(next);

  // doing nothing is valid middleware
  next();
};
const asyncMiddleware: HttpAsyncHandler = async (req, ctx) => {
  expectType<HttpRequest>(req);
  expectType<Context>(ctx);

  // doing nothing is valid middleware
  await (new Promise((resolve) => resolve('foo')));
}
// default callback pattern
arc.http(function (req, res) {
  expectType<HttpRequest>(req);
  expectType<boolean>(req.isBase64Encoded);
  expectType<(p: HttpResponse | Error) => void>(res);

  const responseValue: HttpResponse = { json: { foo: "bar" } };
  expectAssignable<Record<string, any> | undefined>(responseValue.session);
  expectNotAssignable<string>(responseValue.status);
  return res(responseValue);
});
// with middleware
arc.http(middleware, function (req, res) {
  return res({ json: { foo: "bar" } });
});
// async pattern
arc.http(async function (req, ctx) {
  expectType<HttpRequest>(req);
  expectType<Context>(ctx);

  const response: HttpResponse = { html: "<h1>types</h1>" };
  return response;
} as HttpAsyncHandler);
// with async middleware
arc.http(asyncMiddleware, <HttpAsyncHandler>async function (req, ctx) {
  return { text: "types" };
});
// legacy async
arc.http.async(asyncMiddleware, async function (req, ctx) {
  expectType<HttpRequest>(req);
  expectType<string>(req.path);
  expectType<Context>(ctx);

  const response: HttpResponse = { html: "<h1>types</h1>" };
  expectAssignable<number | undefined>(response.status);
  expectNotAssignable<string>(response.session);
  return response;
});
const sampleRequest = {
  httpMethod: "POST" as HttpMethods,
  method: "POST" as HttpMethods,
  path: "/",
  resource: "",
  pathParameters: { foo: "bar" },
  params: { foo: "bar" },
  queryStringParameters: { bar: "baz" },
  query: { bar: "baz" },
  headers: { accept: "any" },
  body: "undefined",
  rawBody: "undefined",
  isBase64Encoded: false,
  version: "42",
};
expectType<Record<string, any>>(arc.http.helpers.bodyParser(sampleRequest));
expectType<HttpRequest>(arc.http.helpers.interpolate(sampleRequest));
expectType<string>(arc.http.helpers.url("/foobar-baz"));

// STATIC
expectType<string>(arc.static("/my-image.png"));
arc.static("/", { stagePath: false });

// TABLES
const dbClient = await arc.tables()
expectType<AwsLiteClient["DynamoDB"]>(dbClient._db)
// expectType<DynamoDB.DocumentClient>(dbClient._doc)
expectType<string>(dbClient.name('widgets'))
expectType<Record<string, string>>(dbClient.reflect())
const myTable = dbClient.foobar
const id42 = await myTable.get({ id: 42 })
await myTable.update({
  Key: { id: 42 },
  UpdateExpression: 'ADD radness :inc',
  ExpressionAttributeValues: { ':inc': 1 },
})
await myTable.put({ id: 42, put: true })
await myTable.delete({ id: 42 })
await myTable.query({
  IndexName: 'fooByBar',
  KeyConditionExpression: 'bar = :bar',
  ExpressionAttributeValues: { ':bar': 'baz' },
})
await myTable.scan({
  FilterExpression: 'radness > :ninethousand',
  ExpressionAttributeValues: { ':ninethousand': 9000 },
})
await myTable.scanAll({
  FilterExpression: 'radness > :ninethousand',
  ExpressionAttributeValues: { ':ninethousand': 9000 },
})

// WS
expectType<AwsLiteClient["ApiGatewayManagementApi"]>(arc.ws._api);
expectType<void>(await arc.ws.send({ id: "foo", payload: { bar: "baz" } }));
expectType<void>(await arc.ws.close({ id: "foo" }));
expectType<GetConnectionResponse>(
  await arc.ws.info({ id: "foo" }),
);
