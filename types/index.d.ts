/// <reference types="node" />

import { ArcHTTP } from "./http";
import { ArcStatic } from "./static";
import { ArcWebSocket } from "./ws";
import { ArcEvents, ArcQueues } from "./events";
import { ArcTables } from "./tables";

export const http: ArcHTTP;
export const static: ArcStatic;
export const ws: ArcWebSocket; // TODO
export const services: any; // TODO
export const events: ArcEvents;
export const queues: ArcQueues;
export const tables: ArcTables;
