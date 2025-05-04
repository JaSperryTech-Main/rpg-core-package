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
    console.log(`[${this.name}] initialized.`);
  }
}

// === Exports for Module === \\
export * from "./Inventory";
