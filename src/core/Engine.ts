// rpg-core/src/core/Engine.ts

import {
  ConfigManager,
  DefaultConfig,
  type Config,
} from "@modules/ConfigModule";
import { GameModule, ModuleState, ModuleRegistry } from "./types";
import * as fs from "fs";
import * as path from "path";
import { logger } from "@utils/logger";
import { EventManager } from "./EventManager";

export class Engine {
  private configManager: ConfigManager;
  public eventManager = new EventManager();
  private modules: Map<string, GameModule> = new Map();
  private dependencyGraph: Map<string, string[]> = new Map();
  private initialized = false;

  public get config(): Readonly<Config> {
    return this.configManager.config;
  }

  constructor(userConfig?: Partial<Config>) {
    logger.debug("Initializing engine with config:", userConfig);

    // Initialize ConfigManager with defaults and user config
    this.configManager = new ConfigManager(DefaultConfig);
    if (userConfig) {
      this.configManager.update(userConfig);
    }

    // Validate configuration
    if (!this.configManager.validate()) {
      logger.error("Invalid configuration detected - resetting to defaults");
      this.configManager.reset();
    }

    logger.setEngine(this);
  }

  // Add configuration access methods
  public getConfigValue<K extends keyof Config>(path: K): Config[K] {
    return this.configManager.get(path);
  }

  public updateConfig(partialConfig: Partial<Config>) {
    this.configManager.update(partialConfig);
    logger.debug("Configuration updated", this.config);
  }

  private async autoRegisterModules() {
    const modulesPath = path.resolve(__dirname, "../modules");
    logger.debug(`Scanning for modules in: ${modulesPath}`);

    const loadModules = async (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      logger.debug(`Found ${entries.length} entries in modules directory`);

      for (const dirent of entries.filter(
        (d) => d.isDirectory() && !d.name.startsWith("_")
      )) {
        try {
          const modulePath = path.join(dir, dirent.name, "index");
          logger.debug(`Attempting to load module from: ${modulePath}`);

          const { default: ModuleClass } = await import(`${modulePath}`);
          logger.debug(`Loaded module class for: ${dirent.name}`);

          if (typeof ModuleClass !== "function") {
            logger.warn(`Invalid module format in ${dirent.name}`);
            continue;
          }

          const moduleInstance = new ModuleClass();
          this.registerModule(moduleInstance);
          logger.info(`Successfully registered module: ${dirent.name}`);
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes("Cannot find module")) {
              logger.warn(`Skipping ${dirent.name} - no module found`);
            } else {
              logger.error(
                `Module load error in ${dirent.name}: ${error.message}`,
                error
              );
            }
          }
        }
      }
    };

    await loadModules(modulesPath);
  }

  private initializeModules() {
    const sortedModules = this.topologicalSort();
    logger.debug("Module initialization order:", sortedModules);

    for (const moduleName of sortedModules) {
      const module = this.modules.get(moduleName);
      if (!module || !module.enabled) {
        logger.warn(`Skipping ${moduleName} (not enabled or not found)`);
        continue;
      }

      try {
        logger.debug(`Initializing module: ${moduleName}`);
        module.init(this);
        module.state = ModuleState.INITIALIZED;
        logger.info(`Module initialized: ${moduleName}`);
        this.eventManager.emit("module:initialized", module.name);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(`Module init failed: ${module.name}`, error);
        } else {
          logger.error(
            `Module init failed: ${module.name}`,
            new Error(String(error))
          );
        }
        module.enabled = false;
      }
    }
  }

  private topologicalSort(): string[] {
    logger.debug("Performing topological sort on modules");
    const sorted: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (name: string) => {
      if (temp.has(name)) {
        const error = new Error(`Circular dependency: ${name}`);
        logger.error("Dependency error detected", error);
        throw error;
      }
      if (visited.has(name)) return;

      temp.add(name);
      logger.debug(`Visiting module: ${name}`);
      this.dependencyGraph.get(name)?.forEach(visit);
      temp.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    this.dependencyGraph.forEach((_, name) => visit(name));
    return sorted.reverse();
  }

  async initialize() {
    if (this.initialized) {
      logger.warn("Engine already initialized");
      return;
    }

    logger.info("Engine initialization started");
    await this.autoRegisterModules();
    this.initializeModules();
    this.initialized = true;
    logger.info("Engine initialization completed successfully");
  }

  async dispose() {
    logger.info("Disposing engine...");
    const reverseOrder = Array.from(this.modules.entries()).reverse();

    for (const [name, module] of reverseOrder) {
      if (module.state === ModuleState.DISPOSED) {
        logger.debug(`Module already disposed: ${name}`);
        continue;
      }

      try {
        logger.info(`Disposing module: ${name}`);
        if (module.dispose) await module.dispose();
        module.state = ModuleState.DISPOSED;
      } catch (error) {
        logger.error(
          `Failed to dispose ${name}:`,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    this.initialized = false;
    logger.info("Engine disposal complete");
  }

  registerModule(module: GameModule) {
    if (this.modules.has(module.name)) {
      const error = new Error(`Module ${module.name} already registered.`);
      logger.error("Module registration failed", error);
      throw error;
    }

    if (!module.name || typeof module.init !== "function") {
      const error = new Error(
        `Invalid module structure: ${module.constructor.name}`
      );
      logger.error("Invalid module detected", error);
      throw error;
    }

    module.state = ModuleState.REGISTERED;
    module.enabled = module.enabled ?? true;

    this.modules.set(module.name, module);
    this.dependencyGraph.set(module.name, module.dependencies || []);

    logger.debug(`Registered module: ${module.name}`, {
      dependencies: module.dependencies,
      enabled: module.enabled,
    });
  }

  getModule<K extends keyof ModuleRegistry>(name: K): ModuleRegistry[K] {
    logger.debug(`Retrieving module: ${String(name)}`);
    const module = this.modules.get(name as string);

    if (!module) {
      const available = Array.from(this.modules.keys()).join(", ");
      const error = new Error(
        `Module "${String(name)}" not found. Available: ${available}`
      );
      logger.error("Module retrieval failed", error);
      throw error;
    }

    if (!module.enabled) {
      const error = new Error(`Module "${String(name)}" is disabled`);
      logger.warn("Module disabled warning", error);
      throw error;
    }

    if (module.state !== ModuleState.INITIALIZED) {
      const error = new Error(`Module "${String(name)}" not initialized`);
      logger.warn("Module not initialized warning", error);
      throw error;
    }

    return module as ModuleRegistry[K];
  }
}
