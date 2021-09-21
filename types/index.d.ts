import { ArcHttp } from './http';
import { ArcTables } from './tables';
import { ArcWebSocket } from './web-socket';

export { HttpRequest, HttpResponse, HttpHandler } from './http';

export const http: ArcHttp;
export const tables: ArcTables;
export const ws: ArcWebSocket;

declare type Todo = any;
export const static: Todo;
export const events: Todo;
export const queues: Todo;
