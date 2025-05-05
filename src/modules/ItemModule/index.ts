// === Module Setup === \\
import { Engine } from "@core/Engine";
import { GameModule } from "@core/types";
import { ItemManager } from "./itemManager";

declare module "../../core/types" {
  interface ModuleRegistry {
    ItemModule: ItemModule;
  }
}

// ===! MUST HAVE !=== \\
export default class ItemModule implements GameModule {
  name: string = "ItemModule";
  enabled: boolean = true;
  dependencies = ["AttributeModule", "SocketModule"];

  private engine!: Engine;

  public itemManager: ItemManager = new ItemManager();

  init(engine: Engine): void {
    this.engine = engine;
    engine.eventManager.emit("module:init", { name: this.name });
  }
}

// === Exports for Module === \\
export * from "./itemManager";
export * from "./types";
export * from "./categories/Item";
