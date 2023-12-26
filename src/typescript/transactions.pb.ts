/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Empty, MatchResponse } from "./market.pb";

export const protobufPackage = "proto";

export interface DeviceInfo {
  pubkey: string;
  deviceId: string;
}

export interface PaymentsResponse {
  approach: number;
  json: MatchResponse[];
  transactions: TransactionResponse[];
}

export interface JsonReceipt {
  paymentID: string;
  txID: string;
}

export interface ListReceipts {
  receipts: JsonReceipt[];
}

export interface IssuerId {
  id: string;
}

/** Envio ByteArray */
export interface TransactionResponse {
  transaction: Uint8Array;
}

export const PROTO_PACKAGE_NAME = "proto";

export interface TransactionsServiceClient {
  addTxReceipt(request: ListReceipts): Observable<Empty>;

  getPayments(request: IssuerId): Observable<PaymentsResponse>;

  addAccount(request: DeviceInfo): Observable<Empty>;
}

export interface TransactionsServiceController {
  addTxReceipt(request: ListReceipts): Promise<Empty> | Observable<Empty> | Empty;

  getPayments(request: IssuerId): Promise<PaymentsResponse> | Observable<PaymentsResponse> | PaymentsResponse;

  addAccount(request: DeviceInfo): Promise<Empty> | Observable<Empty> | Empty;
}

export function TransactionsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["addTxReceipt", "getPayments", "addAccount"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("TransactionsService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("TransactionsService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const TRANSACTIONS_SERVICE_NAME = "TransactionsService";
