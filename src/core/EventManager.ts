// src/core/EventManager.ts
import { GameEvent, IEventEmitter } from "./types";

export class EventManager implements IEventEmitter {
  private listeners: Map<string, Array<(event: GameEvent) => void>> = new Map();

  on<T = any>(event: string, listener: (event: GameEvent<T>) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off<T = any>(event: string, listener: (event: GameEvent<T>) => void): void {
    const listeners = this.listeners.get(event) || [];
    this.listeners.set(
      event,
      listeners.filter((l) => l !== listener)
    );
  }

  emit<T = any>(event: string, data?: T): void {
    const gameEvent: GameEvent<T> = {
      type: event,
      data,
      timestamp: Date.now(),
    };

    this.listeners.get(event)?.forEach((listener) => listener(gameEvent));

    // Always emit wildcard events
    this.listeners.get("*")?.forEach((listener) => listener(gameEvent));
  }

  clear(): void {
    this.listeners.clear();
  }
}
