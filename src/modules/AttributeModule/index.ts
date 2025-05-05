// === Module Setup ===
import { Engine } from "@core/Engine";
import { GameModule, ModuleRegistry } from "@core/types";

// === Module Augmentation ===
declare module "../../core/types" {
  interface ModuleRegistry {
    AttributeModule: AttributeModule;
  }
}

// ===! MUST HAVE !=== \\
export default class AttributeModule implements GameModule {
  name: string = "AttributeModule";
  enabled: boolean = true;
  dependencies = [];

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    engine.eventManager.emit("module:init", { name: this.name });
  }
}

// === Exports for Module === \\
export * from "./types";
export * from "./Attribute";
