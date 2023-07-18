import { ApiGatewayManagementApi, DynamoDB, SNS, SQS } from "aws-sdk";
import { Context } from "aws-lambda";
import arc from "../";

// EVENTS
let eventsPublishResult: SNS.Types.PublishResponse
const eventsPublishArg = { name: "test", payload: { foo: "bar" } };
eventsPublishResult = await arc.events.publish(eventsPublishArg);

// QUEUES
let queuesPublishResult: SQS.Types.SendMessageResult
const queuesPublishArg = { name: "test", payload: { foo: "bar" } };
queuesPublishResult = await arc.queues.publish(queuesPublishArg);

// HTTP
arc.http(function (request, response) {
  const responseValue = {
    status: 201,
    json: { foo: "bar" },
    session: { foo: "bar" },
  };

  return response(responseValue);
});
arc.http.async(async function (request, context: Context) {
  const response = {
    status: 201,
    html: "<h1>TS</h1>",
    session: { foo: "bar" },
  };

  return response;
});
const sampleRequest = {
  httpMethod: "POST",
  path: "/",
  resource: "",
  pathParameters: { foo: "bar" },
  queryStringParameters: { bar: "baz" },
  headers: { accept: "any" },
  body: "undefined",
  isBase64Encoded: false,
};
arc.http.helpers.bodyParser(sampleRequest);
arc.http.helpers.interpolate(sampleRequest);
arc.http.helpers.url("/foobar-baz");

// STATIC
let staticResponse: string;
staticResponse = arc.static("/my-image.png");

// TABLES
let db: DynamoDB;
let doc: DynamoDB.DocumentClient;
let tableName: string;
const dbClient = await arc.tables()
db = dbClient._db
doc = dbClient._doc
tableName = dbClient.name('widgets')
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
await myTable.scanAll({})

// WS
let ws: ApiGatewayManagementApi;
let wsResponse: ApiGatewayManagementApi.Types.GetConnectionResponse;
ws = arc.ws._api;
await arc.ws.send({ id: "foo", payload: { bar: "baz" } }));
await arc.ws.close({ id: "foo" }));
wsResponse = await arc.ws.info({ id: "foo" }),
