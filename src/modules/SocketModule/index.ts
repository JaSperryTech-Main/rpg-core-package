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

  public test() {
    console.log("Test");
  }

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    console.log(`[${this.name}] initialized.`);
  }
}

// === Exports for Module === \\
export * from "./types";
export * from "./Socket";
