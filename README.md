## In scripts that use modules you have to include:

```typescript
import type {} from "../src/modules";
```

## Modules Must include:

```typescript
// === Module Setup === \\
import { Engine } from "@core/Engine";
import { GameModule } from "@core/types";

// === Module Augmentation === \\
declare module "../../core/types" {
  interface ModuleRegistry {
    referenceName: className;
  }
}

// ===! MUST HAVE !=== \\
export default class className implements GameModule {
  name: string = "referenceName";
  enabled: boolean = true;
  dependencies = ["referenceName01", "referenceName02", "etc"];

  private engine!: Engine;

  init(engine: Engine): void {
    this.engine = engine;
    console.log(`[${this.name}] initialized.`);
  }
}

// === Exports for Module === \\
export * from "./types";
```
