/// <reference types="node" />

import { ArcHTTP } from "./http";
import { Static } from "./static";
import { Events, Queues } from "./events";
import { ArcTables } from "./tables";

export const http: ArcHTTP;
export const static: Static;
export const ws: any; // TODO
export const services: any; // TODO
export const events: Events;
export const queues: Queues;
export const tables: ArcTables;
