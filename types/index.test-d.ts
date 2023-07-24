import { ApiGatewayManagementApi, DynamoDB, SNS, SQS } from "aws-sdk";
import { Context } from "aws-lambda";
import { expectType, expectAssignable, expectNotAssignable } from "tsd";
import type { HttpMethods, HttpRequest, HttpResponse } from "./http";
import arc from "../";

// EVENTS
const eventsPublishArg = { name: "test", payload: { foo: "bar" } };
const eventsPublishResult = await arc.events.publish(eventsPublishArg);
expectType<SNS.Types.PublishResponse>(eventsPublishResult);

// QUEUES
const queuesPublishArg = { name: "test", payload: { foo: "bar" } };
const queuesPublishResult = await arc.queues.publish(queuesPublishArg);
expectType<SQS.Types.SendMessageResult>(queuesPublishResult);

// HTTP
arc.http(function (request, response) {
  expectType<HttpRequest>(request);
  expectType<boolean>(request.isBase64Encoded);

  const responseValue: HttpResponse = { json: { foo: "bar" } };
  expectAssignable<Record<string, any> | undefined>(responseValue.session);
  expectNotAssignable<string>(responseValue.status);
  return response(responseValue);
});
arc.http.async(async function (request, context) {
  expectType<HttpRequest>(request);
  expectType<string>(request.path);
  expectType<Context>(context);

  const response: HttpResponse = { html: "<h1>TS</h1>" };
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

// TABLES
const dbClient = await arc.tables()
expectType<DynamoDB>(dbClient._db)
expectType<DynamoDB.DocumentClient>(dbClient._doc)
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
expectType<ApiGatewayManagementApi>(arc.ws._api);
expectType<void>(await arc.ws.send({ id: "foo", payload: { bar: "baz" } }));
expectType<void>(await arc.ws.close({ id: "foo" }));
expectType<ApiGatewayManagementApi.Types.GetConnectionResponse>(
  await arc.ws.info({ id: "foo" }),
);
