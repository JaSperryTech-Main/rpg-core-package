// === Module Setup === \\
import { Engine } from "@core/Engine";
import { GameModule } from "@core/types";
import { EntityManager } from "./EntityManager";

// === Module Augmentation ===
declare module "../../core/types" {
  interface ModuleRegistry {
    EntityModule: EntityModule;
  }
}

// ===! MUST HAVE !===
export default class EntityModule implements GameModule {
  name: string = "EntityModule";
  enabled: boolean = true;
  dependencies = ["AttributeModule", "InventoryModule", "ConfigModule"];

  public entityManager: EntityManager = new EntityManager();

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    engine.eventManager.emit("module:init", { name: this.name });
  }
}

// === Exports for Module ===
export * from "./Entities";
export * from "./Entities/Player";
export * from "./Entities/Enemy";
export * from "./EntityManager";
