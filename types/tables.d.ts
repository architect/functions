import type { DynamoDB } from "@aws-sdk/client-dynamodb";
import type { DynamoDBDocument, QueryCommandInput, QueryCommandOutput, ScanCommandInput, ScanCommandOutput, UpdateCommandInput, UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { Callback } from "./util";

// Turn off automatic exporting
export { };

// TableName not needed as the library sets it
type Params<InputType> = Omit<InputType, "TableName">;

// As above but also overriding the Key field
type ParamsWithKey<InputType, Item> = Omit<Params<InputType>, "Key"> & {
  Key: Key<Item>;
};

// Just overriding the Items field
type ItemsOutput<OutputType, Item> = Omit<OutputType, "Items"> & {
  Items: Item[];
};

type QueryParams = Params<QueryCommandInput>;
type QueryOutput<Item> = ItemsOutput<QueryCommandOutput, Item>;

type ScanParams = Params<ScanCommandInput>;
type ScanOutput<Item> = ItemsOutput<ScanCommandOutput, Item>;

type UpdateParams<Item> = ParamsWithKey<
  UpdateCommandInput,
  Item
>;
type UpdateOutput = UpdateCommandOutput;

// Depending on the operation, the key attributes may be mandatory, but we don't
// know what the key attributes are, so Partial is the best we can do.
type Key<Item> = Partial<Item>;

export interface ArcTable<Item = unknown> {
  delete(key: Key<Item>): Promise<{}>;
  delete(key: Key<Item>, callback: Callback<{}>): void;

  get(key: Key<Item>): Promise<Item | undefined>;
  get(key: Key<Item>, callback: Callback<Item>): void;

  put(item: Item): Promise<Item>;
  put(item: Item, callback: Callback<Item>): void;

  query(params: QueryParams): Promise<QueryOutput<Item>>;
  query(params: QueryParams, callback: Callback<QueryOutput<Item>>): void;

  scan(params: ScanParams): Promise<ScanOutput<Item>>;
  scan(params: ScanParams, callback: Callback<ScanOutput<Item>>): void;

  update(params: UpdateParams<Item>): Promise<UpdateOutput>;
  update(params: UpdateParams<Item>, callback: Callback<UpdateOutput>): void;
}

type ArcDBWith<Tables> = {
  [tableName in keyof Tables]: ArcTable<Tables[tableName]>;
};

export type ArcDB<Tables> = ArcDBWith<Tables> & {
  name(name: keyof Tables): string;
  reflect(): {
    [tableName in keyof Tables]: string;
  };
  _db: DynamoDB;
  _doc: DynamoDBDocument;
};

// Permissive by default: allows any table, any inputs, any outputs.
type AnyTables = Record<string, any>;

export interface ArcTables {
  <Tables = AnyTables>(): Promise<ArcDB<Tables>>;

  // legacy methods
  insert: any;
  modify: any;
  update: any;
  remove: any;
  destroy: any;
  all: any;
  save: any;
  change: any;
}
