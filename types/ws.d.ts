import type {
  AwsLiteApiGatewayManagementApi,
  GetConnectionResponse,
} from "@aws-lite/apigatewaymanagementapi-types";
import { Callback } from "./util";

// Turn off automatic exporting
export { };

type SendParams = { id: string; payload: any };
type CloseParams = { id: string };
type InfoParams = { id: string };

export interface ArcWebSocket {
  _api(): Promise<AwsLiteApiGatewayManagementApi>;
  _api(callback: Callback<AwsLiteApiGatewayManagementApi>): void;

  send(params: SendParams): Promise<void>;
  send(params: SendParams, callback: Callback<void>): void;

  close(params: CloseParams): Promise<void>;
  close(params: CloseParams, callback: Callback<void>): void;

  info(params: InfoParams): Promise<GetConnectionResponse>;
  info(params: InfoParams, callback: Callback<GetConnectionResponse>): void;
}
