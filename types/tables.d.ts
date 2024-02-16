import type {
  AwsLiteDynamoDB,
  QueryResponse,
  ScanResponse,
  UpdateItemResponse,
} from "@aws-lite/dynamodb-types"
import { Callback } from "./util";

// Turn off automatic exporting
export { };

// TableName not needed as the library sets it
type TablesParams<InputType> = Omit<InputType, "TableName">;

// As above but also overriding the Key field
type TablesParamsWithKey<InputType, Item> = Omit<TablesParams<InputType>, "Key">
  & { Key: Key<Item>};

// Just overriding the Items field
type ItemsOutput<OutputType, Item> = Omit<OutputType, "Items">
  & { Items: Item[] };

type QueryParams = TablesParams<Parameters<AwsLiteDynamoDB["Query"]>[0]>;
type QueryOutput<Item> = ItemsOutput<QueryResponse, Item>;

type ScanParams = TablesParams<Parameters<AwsLiteDynamoDB["Scan"]>[0]>;
type ScanOutput<Item> = ItemsOutput<ScanResponse, Item>;

type UpdateParams<Item> = TablesParamsWithKey<
  Parameters<AwsLiteDynamoDB["UpdateItem"]>[0],
  Item
>;

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

  scanAll(params: ScanParams): Promise<Item[]>;

  update(params: UpdateParams<Item>): AwsLiteDynamoDB["UpdateItem"];
  update(params: UpdateParams<Item>, callback: Callback<UpdateItemResponse>): void;
}

type ArcDBWith<Tables> = {
  [tableName in keyof Tables]: ArcTable<Tables[tableName]>;
};

export type ArcDB<Tables> = ArcDBWith<Tables> & {
  name(name: keyof Tables): string;
  reflect(): {
    [tableName in keyof Tables]: string;
  };
  _client: AwsLiteDynamoDB;
  // _db: DynamoDB;
  // _doc: DynamoDB.DocumentClient;
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
