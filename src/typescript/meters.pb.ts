/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { PaymentsResponse } from "./transactions.pb";

export const protobufPackage = "proto";

export interface MeterEntry {
  deviceId: string;
  activeImport: number;
  activeExport: number;
  reactiveInductive: number;
  reactiveCapacitive: number;
  timestamp: string;
}

export interface MeterResponse {
  status: number;
  payments?: PaymentsResponse | undefined;
  message?: string | undefined;
}

export interface QueryMeters {
  startInterval?: string | undefined;
  deviceId?: string | undefined;
  skip?: number | undefined;
  limit?: number | undefined;
}

export interface QueryResponse {
  entries: MeasurementResponse[];
  status?: number | undefined;
  error?: string | undefined;
}

export interface MeasurementResponse {
  DeviceId: string;
  Field: string;
  Value: string;
  Date: string;
}

export const PROTO_PACKAGE_NAME = "proto";

export interface MetersServiceClient {
  addMeasurement(request: MeterEntry): Observable<MeterResponse>;

  retrieveMeasurement(request: QueryMeters): Observable<QueryResponse>;
}

export interface MetersServiceController {
  addMeasurement(request: MeterEntry): Promise<MeterResponse> | Observable<MeterResponse> | MeterResponse;

  retrieveMeasurement(request: QueryMeters): Promise<QueryResponse> | Observable<QueryResponse> | QueryResponse;
}

export function MetersServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["addMeasurement", "retrieveMeasurement"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("MetersService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("MetersService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const METERS_SERVICE_NAME = "MetersService";
