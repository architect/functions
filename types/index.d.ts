/// <reference types="node" />

import { ArcHTTP } from "./http";
import { ArcStatic } from "./static";
import { ArcWebSocket } from "./ws";
import { ArcEvents, ArcQueues } from "./events";
import { ArcTables } from "./tables";

type ArcServices = () => Promise<Record<string, any>>;

export const http: ArcHTTP;
export const static: ArcStatic;
export const ws: ArcWebSocket;
export const services: ArcServices;
export const events: ArcEvents;
export const queues: ArcQueues;
export const tables: ArcTables;
