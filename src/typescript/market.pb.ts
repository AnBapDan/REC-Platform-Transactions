/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "proto";

export enum State {
  Created = 0,
  Sent = 1,
  Paid = 2,
  NotPaid = 3,
  Error = 4,
  UNRECOGNIZED = -1,
}

export interface Empty {
}

export interface MatchesFilter {
  buyerID?: string | undefined;
  sellerID?: string | undefined;
  state: State[];
  startTimestamp?: string | undefined;
  endTimestamp?: string | undefined;
  matchID?: string | undefined;
  skip?: number | undefined;
  limit?: number | undefined;
}

export interface MatchResponse {
  timestamp: string;
  buyerID: string;
  sellerID: string;
  energy: number;
  price: number;
  id: string;
  createdAt: string;
  transactionID?: string | undefined;
  transactionState?: State | undefined;
  updatedAt?: string | undefined;
  message?: string | undefined;
}

export interface ListMatchResponse {
  matches: MatchResponse[];
}

export interface UpdateMatch {
  matchID: string;
  state: State;
  transactionID?: string | undefined;
  message?: string | undefined;
}

export interface ListUpdateMatch {
  matches: UpdateMatch[];
}

export interface PriceUpdate {
  timestamp: string;
  meterID: string;
  buyPrice: number;
  sellPrice: number;
}

export interface ListPricesUpdate {
  prices: PriceUpdate[];
}

export interface PriceFilter {
  meterID: string;
  startTimestamp?: string | undefined;
  endTimestamp?: string | undefined;
  skip?: number | undefined;
  limit?: number | undefined;
}

export interface PriceResponse {
  timestamp: string;
  meterID: string;
  sellPrice: number;
  buyPrice: number;
}

export interface ListPrices {
  prices: PriceResponse[];
}

export const PROTO_PACKAGE_NAME = "proto";

/** This service is responsible for changing Database entries when asked via another microservice (ex. Transactions Microservice) */

export interface AuthenticatedMarketServiceClient {
  retrieveMatches(request: MatchesFilter): Observable<ListMatchResponse>;

  updateMatch(request: ListUpdateMatch): Observable<Empty>;
}

/** This service is responsible for changing Database entries when asked via another microservice (ex. Transactions Microservice) */

export interface AuthenticatedMarketServiceController {
  retrieveMatches(
    request: MatchesFilter,
  ): Promise<ListMatchResponse> | Observable<ListMatchResponse> | ListMatchResponse;

  updateMatch(request: ListUpdateMatch): Promise<Empty> | Observable<Empty> | Empty;
}

export function AuthenticatedMarketServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["retrieveMatches", "updateMatch"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AuthenticatedMarketService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AuthenticatedMarketService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const AUTHENTICATED_MARKET_SERVICE_NAME = "AuthenticatedMarketService";

/** This service is responsible for handling non critical requests. (ex. Retrieving data for dashboards or auditing) */

export interface MarketServiceClient {
  getMatches(request: MatchesFilter): Observable<ListMatchResponse>;

  updatePrices(request: ListPricesUpdate): Observable<Empty>;

  getPrices(request: PriceFilter): Observable<ListPrices>;
}

/** This service is responsible for handling non critical requests. (ex. Retrieving data for dashboards or auditing) */

export interface MarketServiceController {
  getMatches(request: MatchesFilter): Promise<ListMatchResponse> | Observable<ListMatchResponse> | ListMatchResponse;

  updatePrices(request: ListPricesUpdate): Promise<Empty> | Observable<Empty> | Empty;

  getPrices(request: PriceFilter): Promise<ListPrices> | Observable<ListPrices> | ListPrices;
}

export function MarketServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getMatches", "updatePrices", "getPrices"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("MarketService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("MarketService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const MARKET_SERVICE_NAME = "MarketService";
