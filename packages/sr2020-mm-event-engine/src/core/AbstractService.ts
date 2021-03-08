import * as R from 'ramda';

import { GameModel } from "./GameModel";

import { Metadata, GMAction, GMRequest, GMLogger } from "./types";
import { stringToType, typeToGetter } from "./utils";

export class AbstractService {
  // logger: GMLogger;

  // gameModel: GameModel;

  metadata: Metadata = {
    actions: [],
    requests: [],
    emitEvents: [],
    needActions: [],
    needRequests: [],
    listenEvents: [],
  };

  constructor(public gameModel: GameModel, public logger: GMLogger) {}

  init() {}

  // eslint-disable-next-line class-methods-use-this
  // setData() {}

  // eslint-disable-next-line class-methods-use-this
  // getData() {
  //   return {};
  // }

  // eslint-disable-next-line class-methods-use-this
  dispose() {}

  execute<T>(action: GMAction): T {
    const includes = this.metadata.actions.includes(action.type);
    // @ts-ignore
    if (includes && !!this[action.type]) {
      // @ts-ignore
      return this[action.type](action);
    }
    if (!includes) {
      throw new Error(`Action ${action.type} is not found in ${this.constructor.name} metadata`);
    } else {
      throw new Error(`Action ${action.type} is not found in ${this.constructor.name} instance`);
    }

    // return onDefaultAction(action);
  }

  get<T>(request: GMRequest): T {
    const includes = this.metadata.requests.includes(request.type);
    // @ts-ignore
    if (includes && !!this[typeToGetter(request.type)]) {
      // @ts-ignore
      return this[typeToGetter(request.type)](request);
    }
    if (!includes) {
      throw new Error(`Request ${request.type} is not found in ${this.constructor.name} metadata`);
    } else {
      throw new Error(`Request ${request.type} is not found in ${this.constructor.name} instance`);
    }

    // return onDefaultRequest(request);
  }

  emit(event: string, ...args: unknown[]): boolean {
    if (this.gameModel === null) {
      throw new Error(`Service ${this.constructor.name} is not initialized`);
    }
    // console.log('emit', args[0]);
    if (!this.metadata.emitEvents.includes(event)) {
      throw new Error(`Event ${event} is not in emit events list of ${this.constructor.name}`);
    }
    return this.gameModel.emit(event, ...args);
  }

  on(event: string, listener: (...args: unknown[]) => void): GameModel {
    if (this.gameModel === null) {
      throw new Error(`Service ${this.constructor.name} is not initialized`);
    }
    if (!this.metadata.listenEvents.includes(event)) {
      throw new Error(`Event ${event} is not in listen events list of ${this.constructor.name}`);
    }
    return this.gameModel.on(event, listener);
  }

  off(event: string, listener: (...args: unknown[]) => void): GameModel {
    if (this.gameModel === null) {
      throw new Error(`Service ${this.constructor.name} is not initialized`);
    }
    if (!this.metadata.listenEvents.includes(event)) {
      throw new Error(`Event ${event} is not in listen events list of ${this.constructor.name}`);
    }
    return this.gameModel.off(event, listener);
  }

  // getFromModel(rawRequest: GMRequest | string) {
  //   const request: GMRequest = stringToType<GMRequest>(rawRequest);

  //   const { needRequests } = this.metadata;
  //   if (needRequests && !needRequests.includes(request.type)) {
  //     throw new Error(`Request ${request.type} is not expected from ${this.constructor.name}`);
  //   }

  //   return this.gameModel.get(rawRequest);
  // }
  getFromModel<T extends GMRequest, K>(rawRequest: T | string): K {
    if (this.gameModel === null) {
      throw new Error(`Service ${this.constructor.name} is not initialized`);
    }
    const request: T = stringToType<T>(rawRequest);

    const { needRequests } = this.metadata;
    if (needRequests && !needRequests.includes(request.type)) {
      throw new Error(`Request ${request.type} is not expected from ${this.constructor.name}`);
    }

    return this.gameModel.get(rawRequest) as K;
  }

  executeOnModel<T extends GMAction, K>(rawAction: T | string): K {
    if (this.gameModel === null) {
      throw new Error(`Service ${this.constructor.name} is not initialized`);
    }
    const action: T = stringToType<T>(rawAction);

    const { needActions } = this.metadata;
    if (needActions && !needActions.includes(action.type)) {
      throw new Error(`Action ${action.type} is not expected from ${this.constructor.name}`);
    }

    return this.gameModel.execute(rawAction) as K;
  }

  setMetadata(metadata: Metadata): void {
    this.metadata = { ...this.metadata, ...metadata };
  }
}
