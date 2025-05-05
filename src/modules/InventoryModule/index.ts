// === Module Setup === \\
import { Engine } from "@core/Engine";
import { GameModule } from "@core/types";

// === Declare Module === \\
declare module "../../core/types" {
  interface ModuleRegistry {
    InventoryModule: InventoryModule;
  }
}

// ===! MUST HAVE !=== \\
export default class InventoryModule implements GameModule {
  name: string = "InventoryModule";
  enabled: boolean = true;
  dependencies = ["ItemModule"];

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    engine.eventManager.emit("module:init", { name: this.name });
  }
}

// === Exports for Module === \\
export * from "./Inventory";
