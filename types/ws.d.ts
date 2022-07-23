import { ApiGatewayManagementApi } from "aws-sdk";
import { Callback } from "./util";

// Turn off automatic exporting
export {};

type SendParams = { id: string; payload: any };
type CloseParams = { id: string };
type InfoParams = { id: string };
type InfoResponse = ApiGatewayManagementApi.Types.GetConnectionResponse;

export interface ArcWebSocket {
  _api: ApiGatewayManagementApi;

  send(params: SendParams): Promise<void>;
  send(params: SendParams, callback: Callback<void>): void;

  close(params: CloseParams): Promise<void>;
  close(params: CloseParams, callback: Callback<void>): void;

  info(params: InfoParams): Promise<InfoResponse>;
  info(params: InfoParams, callback: Callback<InfoResponse>): void;
}
