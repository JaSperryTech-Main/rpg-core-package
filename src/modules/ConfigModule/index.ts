// === Module Setup ===
import { Engine } from "@core/Engine";
import { GameModule, ModuleRegistry } from "@core/types";

// === Module Augmentation ===
declare module "../../core/types" {
  interface ModuleRegistry {
    ConfigModule: ConfigModule;
  }
}

// ===! MUST HAVE !=== \\
export default class ConfigModule implements GameModule {
  name: string = "ConfigModule";
  enabled: boolean = true;
  dependencies = [];

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    console.log(`[${this.name}] initialized.`);
  }
}

// === Exports for Module === \\
export * from "./ConfigManager";
export * from "./registry";
export * from "./types";
