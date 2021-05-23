export interface GMTyped {
  type: string;
  [key: string]: any;
}

export interface GMRequest extends GMTyped {
  
}

export interface GMAction extends GMTyped {

}

export interface GMEvent {
  type: string;
}
export interface GMEvent2 extends Record<string, unknown> {
  type: string;
}

export interface DefaultGMEvent {
  type: 'undefined';
}

// export type GMLogger = unknown;

export interface GMLogger {
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  customChild?: (baseLogger: GMLogger, defaultMeta: object) => GMLogger;
  child?: (options: Object) => GMLogger;
  defaultMeta?: object;
  stream?(options?: any): NodeJS.ReadableStream;
}

export interface Metadata {
  actions: string[];
  requests: string[];
  emitEvents: string[];
  needActions: string[];
  needRequests: string[];
  listenEvents: string[];
};

export interface EventProcessorMetadata {
  emitEvents: string[];
  listenEvents: string[];
};



// interface Action<T extends string, L, S = void> {
//   action: L & {
//     type: T;
//   };
//   response: S;
// }

// interface Event<T extends string, L> {
//   event: L & {
//     type: T;
//   };
// }


// type func = (value: 'word' | number) => string | null;

// Type for object with type field - applicable to requests, actions and events
export type Typed<T extends string, L = {}> = L & {type: T};

// If some call is argumentless we can use any of "typeString" or {type: "typeString"}
export type TypeOnly<T extends string = any> = T | {type: T};

export type TypeObjectOnly<T extends string> = {type: T};

// stub for generic function
// type Function = (...arg: any) => any;

export type RequestHandler<T extends any[] = any[], K = any> = (...arg: T) => K;

// Request
export type Req<T extends RequestHandler> = Parameters<T>[0];
// Response
export type Res<T extends RequestHandler> = ReturnType<T>;

export interface WebSocketInitClientConfig {
  message: 'initClientConfig';
  data: {
    type: string,
    payload: string;
  }[];
  forwardActions: string[];
}