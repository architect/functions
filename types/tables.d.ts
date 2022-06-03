import type { DynamoDB } from "aws-sdk";

// TableName not needed as the library sets it
type Params<InputType> = Omit<InputType, "TableName">;

// Strip and then override the Items field
type ItemsOutput<OutputType, Item> = Omit<OutputType, "Items"> & {
  Items: Item[];
};

type QueryParams = Params<DynamoDB.DocumentClient.QueryInput>;
type QueryOutput<Item> = ItemsOutput<DynamoDB.DocumentClient.QueryOutput, Item>;

type ScanParams = Params<DynamoDB.DocumentClient.ScanInput>;
type ScanOutput<Item> = ItemsOutput<DynamoDB.DocumentClient.ScanOutput, Item>;

type UpdateParams = Params<DynamoDB.DocumentClient.UpdateItemInput>;
type UpdateOutput = DynamoDB.DocumentClient.UpdateItemOutput;

// Depending on the operation, the key attributes may be mandatory, but we don't
// know what the key attributes are, so Partial is the best we can do.
type Key<Item> = Partial<Item>;

type Callback<Res> = (err: Error, res: Res) => void;

export interface ArcTable<Item = unknown> {
  delete(key: Key<Item>): Promise<{}>;
  delete(key: Key<Item>, callback: Callback<{}>): void;

  get(key: Key<Item>): Promise<Item>;
  get(key: Key<Item>, callback: Callback<Item>): void;

  put(item: Item): Promise<{}>;
  put(item: Item, callback: Callback<{}>): void;

  query(params: QueryParams): Promise<QueryOutput<Item>>;
  query(params: QueryParams, callback: Callback<QueryOutput<Item>>): void;

  scan(params: ScanParams): Promise<ScanOutput<Item>>;
  scan(params: ScanParams, callback: Callback<ScanOutput<Item>>): void;

  update(params: UpdateParams): Promise<UpdateOutput>;
  update(params: UpdateParams, callback: Callback<UpdateOutput>): void;
}

type DB<Tables> = {
  [tableName in keyof Tables]: ArcTable<Tables[tableName]>;
};

// Permissive by default: allows any table, any inputs, any outputs.
type AnyTables = Record<string, any>;

export interface ArcTables {
  <Tables = AnyTables>(): Promise<DB<Tables>>;

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
