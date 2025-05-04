// src/core/types.ts
import { Engine } from "./Engine";

export enum ModuleState {
  REGISTERED,
  INITIALIZED,
  DISPOSED,
}

export interface IEventEmitter {
  on(event: string, listener: Function): void;
  off(event: string, listener: Function): void;
  emit(event: string, ...args: any[]): void;
}

export interface GameModule<TConfig = any> {
  name: string;
  enabled: boolean;
  dependencies?: string[];
  state?: ModuleState;
  config?: TConfig;
  init: (engine: Engine) => void;
  dispose?(): Promise<void>;
}
