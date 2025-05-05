// src/core/types.ts
import { Engine } from "./Engine";

export enum ModuleState {
  REGISTERED,
  INITIALIZED,
  DISPOSED,
  ERROR,
}

export interface GameEvent<T = any> {
  type: string;
  data?: T;
  timestamp: number;
}

export interface IEventEmitter {
  on<T = any>(event: string, listener: (event: GameEvent<T>) => void): void;
  off<T = any>(event: string, listener: (event: GameEvent<T>) => void): void;
  emit<T = any>(event: string, data?: T): void;
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
