/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "proto";

export interface Empty {
}

export interface SensorEntry {
  deviceId: string;
  parkingStatus: number;
  timestamp: string;
}

export interface SensorResponse {
  status: number;
  error: string[];
}

export interface QuerySensors {
  startInterval: string;
  deviceId: string;
  status: number;
  skip: number;
  limit: number;
}

export interface QueryResponse {
  entries: ParkingResponse[];
}

export interface ParkingResponse {
  DeviceId: string;
  Field: string;
  Value: string;
  Date: string;
}

export const PROTO_PACKAGE_NAME = "proto";

export interface SensorServiceClient {
  addEntry(request: SensorEntry): Observable<SensorResponse>;

  retrieveLatestEntries(request: Empty): Observable<QueryResponse>;

  retrieveEntry(request: QuerySensors): Observable<QueryResponse>;
}

export interface SensorServiceController {
  addEntry(request: SensorEntry): Promise<SensorResponse> | Observable<SensorResponse> | SensorResponse;

  retrieveLatestEntries(request: Empty): Promise<QueryResponse> | Observable<QueryResponse> | QueryResponse;

  retrieveEntry(request: QuerySensors): Promise<QueryResponse> | Observable<QueryResponse> | QueryResponse;
}

export function SensorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["addEntry", "retrieveLatestEntries", "retrieveEntry"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("SensorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("SensorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const SENSOR_SERVICE_NAME = "SensorService";
