import {
  ConfigManager,
  DefaultConfig,
  type Config,
} from "@modules/ConfigModule";
import { GameModule, ModuleState, ModuleRegistry } from "./types";
import * as fs from "fs/promises";
import * as path from "path";
import { logger } from "@utils/logger";
import { EventManager } from "./EventManager";

// Custom Error Classes
export class ModuleRegistrationError extends Error {}
export class CircularDependencyError extends Error {}
export class ModuleNotFoundError extends Error {}
export class ModuleNotInitializedError extends Error {}

const MODULE_EVENTS = {
  INITIALIZED: "module:initialized",
  DISPOSED: "module:disposed",
};

export class Engine {
  private readonly configManager: ConfigManager;
  public readonly eventManager = new EventManager();
  private readonly modules: Map<string, GameModule> = new Map();
  private readonly dependencyGraph: Map<string, string[]> = new Map();
  public readonly logger = logger;
  private initialized = false;

  public get config(): Readonly<Config> {
    return this.configManager.config;
  }

  constructor(userConfig?: Partial<Config>) {
    logger.debug("Initializing engine with config:", userConfig);
    this.configManager = new ConfigManager({ ...DefaultConfig, ...userConfig });

    // Validate configuration
    if (!this.configManager.validate()) {
      logger.error("Invalid configuration detected - resetting to defaults");
      this.configManager.reset();
    }

    logger.setEngine(this);
  }

  public getConfigValue<K extends keyof Config>(key: K): Config[K] {
    return this.configManager.get(key);
  }

  public updateConfig(partialConfig: Partial<Config>): void {
    if (this.initialized) {
      logger.warn("Configuration update after initialization");
    }
    this.configManager.update(partialConfig);
    logger.debug("Configuration updated", this.config);
  }

  private async discoverAndRegisterModules(): Promise<void> {
    const modulesPath = path.resolve(__dirname, "../modules");
    logger.debug(`Discovering modules in: ${modulesPath}`);

    try {
      const entries = await fs.readdir(modulesPath, { withFileTypes: true });
      await Promise.all(
        entries
          .filter(
            (dirent) => dirent.isDirectory() && !dirent.name.startsWith("_")
          )
          .map(async (dirent) => {
            try {
              const modulePath = path.join(modulesPath, dirent.name, "index");
              const { default: ModuleClass } = await import(modulePath);

              if (typeof ModuleClass !== "function") {
                logger.warn(`Invalid module format in ${dirent.name}`);
                return;
              }

              const moduleInstance = new ModuleClass();
              this.registerModule(moduleInstance);
              logger.info(`Registered module: ${dirent.name}`);
            } catch (error) {
              this.handleModuleLoadingError(error, dirent.name);
            }
          })
      );
    } catch (error) {
      logger.error(
        "Module discovery failed:",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private handleModuleLoadingError(error: unknown, moduleName: string): void {
    if (
      error instanceof Error &&
      error.message.includes("Cannot find module")
    ) {
      logger.warn(`Skipping ${moduleName} - missing module file`);
    } else {
      logger.error(
        `Failed to load module ${moduleName}:`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private initializeEventHandlers(): void {
    this.eventManager.on(MODULE_EVENTS.INITIALIZED, (module) => {
      logger.info(`Module initialized: ${module.data.name}`);
    });

    this.eventManager.on(MODULE_EVENTS.DISPOSED, (module) => {
      logger.info(`Module disposed: ${module.data.name}`);
    });
  }

  private async initializeModuleLifecycle(): Promise<void> {
    const sortedModules = this.topologicalSort();
    logger.debug("Module initialization order:", sortedModules);

    for (const moduleName of sortedModules) {
      const module = this.modules.get(moduleName);
      if (!module?.enabled) {
        logger.debug(`Skipping disabled module: ${moduleName}`);
        continue;
      }

      try {
        logger.debug(`Initializing module: ${moduleName}`);
        await module.init(this);
        module.state = ModuleState.INITIALIZED;
        this.eventManager.emit(MODULE_EVENTS.INITIALIZED, {
          name: module.name,
        });
      } catch (error) {
        this.handleModuleInitializationError(error, module);
      }
    }
  }

  private handleModuleInitializationError(
    error: unknown,
    module?: GameModule
  ): void {
    const errorMessage = module
      ? `Module initialization failed: ${module.name}`
      : "Unknown module initialization error";

    logger.error(
      errorMessage,
      error instanceof Error ? error : new Error(String(error))
    );

    if (module) {
      module.enabled = false;
      module.state = ModuleState.ERROR;
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn("Engine already initialized");
      return;
    }

    logger.info("Starting engine initialization");
    try {
      await this.discoverAndRegisterModules();
      this.initializeEventHandlers();
      await this.initializeModuleLifecycle();
      this.initialized = true;
      logger.info("Engine initialized successfully");
    } catch (error) {
      logger.error(
        "Engine initialization failed:",
        error instanceof Error ? error : new Error(String(error))
      );
      await this.shutdown();
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    logger.info("Starting engine shutdown");
    const reverseOrder = Array.from(this.modules.values()).reverse();

    await Promise.allSettled(
      reverseOrder.map(async (module) => {
        if (module.state === ModuleState.DISPOSED) return;

        try {
          logger.debug(`Disposing module: ${module.name}`);
          if (module.dispose) await module.dispose();
          module.state = ModuleState.DISPOSED;
          this.eventManager.emit(MODULE_EVENTS.DISPOSED, module);
        } catch (error) {
          logger.error(
            `Failed to dispose ${module.name}:`,
            error instanceof Error ? error : new Error(String(error))
          );
        }
      })
    );

    this.initialized = false;
    logger.info("Engine shutdown completed");
  }

  public registerModule(module: GameModule): void {
    if (this.modules.has(module.name)) {
      throw new ModuleRegistrationError(
        `Module ${module.name} already registered`
      );
    }

    if (!module.name || typeof module.init !== "function") {
      throw new ModuleRegistrationError(
        `Invalid module structure: ${module.constructor.name}`
      );
    }

    module.state = ModuleState.REGISTERED;
    module.enabled = module.enabled ?? true;

    this.validateModuleDependencies(module);
    this.modules.set(module.name, module);
    this.dependencyGraph.set(module.name, module.dependencies || []);

    logger.debug(`Registered module: ${module.name}`, {
      dependencies: module.dependencies,
      enabled: module.enabled,
    });
  }

  private validateModuleDependencies(module: GameModule): void {
    module.dependencies?.forEach((dep) => {
      if (!this.modules.has(dep)) {
        logger.warn(`Missing dependency: ${module.name} requires ${dep}`);
      }
    });
  }

  public getModule<K extends keyof ModuleRegistry>(name: K): ModuleRegistry[K] {
    const module = this.modules.get(name as string);

    if (!module) {
      const available = Array.from(this.modules.keys()).join(", ");
      throw new ModuleNotFoundError(
        `Module "${name}" not found. Available modules: ${available}`
      );
    }

    if (!module.enabled) {
      throw new ModuleNotInitializedError(`Module "${name}" is disabled`);
    }

    if (module.state !== ModuleState.INITIALIZED) {
      throw new ModuleNotInitializedError(`Module "${name}" not initialized`);
    }

    return module as ModuleRegistry[K];
  }

  private topologicalSort(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const visit = (moduleName: string) => {
      if (stack.has(moduleName)) {
        throw new CircularDependencyError(
          `Circular dependency detected: ${moduleName}`
        );
      }
      if (visited.has(moduleName)) return;

      stack.add(moduleName);
      this.dependencyGraph.get(moduleName)?.forEach(visit);
      stack.delete(moduleName);
      visited.add(moduleName);
      sorted.push(moduleName);
    };

    Array.from(this.dependencyGraph.keys()).forEach(visit);
    return sorted.reverse();
  }
}
