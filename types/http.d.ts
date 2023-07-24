import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Callback } from "./util";

// Turn off automatic exporting
export { };

export type HttpMethods = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type ApiGatewayRequestVersion = "1.0" | "2.0" | string;
export type SessionData = Record<string, any>;

export interface HttpRequest {
  httpMethod: HttpMethods;
  /** The absolute path of the request */
  path: string;
  /** The absolute path of the request, with resources substituted for actual path parts (e.g. /{foo}/bar) */
  resource: string;
  /** Any URL params, if defined in your HTTP Function's path (e.g. foo in GET /:foo/bar) */
  pathParameters: Record<string, string>;
  /** Any query params if present in the client request */
  queryStringParameters: Record<string, string>;
  /** All client request headers */
  headers: Record<string, string>;
  /** The request body in a base64-encoded buffer. You'll need to parse request.body before you can use it, but Architect provides tools to do this - see parsing request bodies. */
  body: any;
  /** Indicates whether body is base64-encoded binary payload (will always be true if body has not null) */
  isBase64Encoded: boolean;
  /** When the request/response is run through arc.http.async (https://arc.codes/docs/en/reference/runtime/node#arc.http.async) then it will have session added. */
  session?: SessionData | undefined;
  version: ApiGatewayRequestVersion;
  rawBody: string;
  method: HttpMethods;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface HttpResponse {
  /** Sets the HTTP status code */
  statusCode?: number | undefined;
  /** Alias for @see statusCode */
  status?: number | undefined;
  /** All response headers */
  headers?: Record<string, string> | undefined;
  /**
   * Contains request body, either as a plain string (no encoding or serialization required) or, if binary, base64-encoded buffer
   * Note: The maximum body payload size is 6MB
   */
  body?: string | undefined;
  /**
   * Indicates whether body is base64-encoded binary payload
   * Required to be set to true if emitting a binary payload
   */
  isBase64Encoded?: boolean | undefined;
  /** When the request/response is run through arc.http.async (https://arc.codes/docs/en/reference/runtime/node#arc.http.async) then it will have session added. */
  session?: SessionData | undefined;
  /**
   * When used with https://arc.codes/docs/en/reference/runtime/node#arc.http.async
   * json sets the Content-Type header to application/json
   */
  json?: any | undefined;
  /**
   * When used with https://arc.codes/docs/en/reference/runtime/node#arc.http.async
   * json sets the Content-Type header to application/json
   */
  html?: string | undefined;
  css?: string | undefined;
  js?: string | undefined;
  text?: string | undefined;
  xml?: string | undefined;
}

export type HttpHandler = (
  req: HttpRequest,
  res: (resOrError: HttpResponse | Error) => void,
  next: () => void,
) => void;

export type HttpAsyncHandler = (
  req: HttpRequest,
  context: Context,
) => Promise<HttpResponse | void>;

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

export interface ArcHTTP {
  (...handlers: HttpHandler[]): LambdaHandler;      // these method signatures are the same
  (...handlers: HttpAsyncHandler[]): LambdaHandler; // unable to overload gracefully
  async: (...handlers: HttpAsyncHandler[]) => LambdaHandler;
  helpers: {
    bodyParser: (req: HttpRequest) => Record<string, any>;
    interpolate: (req: HttpRequest) => HttpRequest;
    url: (url: string) => string;
  };
  session: {
    read(req: HttpRequest): Promise<SessionData>;
    read(req: HttpRequest, callback: Callback<SessionData>): void;
    write(sess: SessionData): Promise<string>;
    write(sess: SessionData, callback: Callback<string>): void;
  };
}
