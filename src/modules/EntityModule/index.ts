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
  dependencies = ["AttributeModule", "InventoryModule"];

  public entityManager: EntityManager = new EntityManager();

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    console.log(`[${this.name}] initialized.`);
  }
}

// === Exports for Module ===
export * from "./Entity";
export * from "./Player";
export * from "./Enemy";
export * from "./EntityManager";
