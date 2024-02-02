/// <reference types="node" />

import { ArcEvents, ArcQueues } from "./events";
import { ArcHTTP, HttpHandler, HttpAsyncHandler } from "./http";
import { ArcStatic } from "./static";
import { ArcTables } from "./tables";
import { ArcWebSocket } from "./ws";

export type { HttpHandler, HttpAsyncHandler };
export type ArcServices = () => Promise<Record<string, any>>;

export const events: ArcEvents;
export const http: ArcHTTP;
export const queues: ArcQueues;
export const services: ArcServices;
export const static: ArcStatic;
export const tables: ArcTables;
export const ws: ArcWebSocket;
