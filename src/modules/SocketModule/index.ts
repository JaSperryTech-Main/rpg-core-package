// === Module Setup ===
import { Engine } from "@core/Engine";
import { GameModule } from "@core/types";

// === Module Augmentation ===
declare module "../../core/types" {
  interface ModuleRegistry {
    SocketModule: SocketModule;
  }
}

// ===! MUST HAVE !=== \\
export default class SocketModule implements GameModule {
  name: string = "SocketModule";
  enabled: boolean = true;
  dependencies = ["AttributeModule"];

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    engine.eventManager.emit("module:init", { name: this.name });
  }
}

// === Exports for Module === \\
export * from "./types";
export * from "./Socket";
