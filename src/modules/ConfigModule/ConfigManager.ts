import { DefaultConfig } from "./registry";
import { Config } from "./types";

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: `${K & string}${"" | `.${NestedKeyOf<T[K]>}`}`;
    }[keyof T]
  : never;

type GetNestedType<T, K extends string> = K extends `${infer P}.${infer S}`
  ? P extends keyof T
    ? T[P] extends object
      ? GetNestedType<T[P], S>
      : never
    : never
  : K extends keyof T
  ? T[K]
  : never;

export class ConfigManager {
  private _config: Config;

  public get config(): Readonly<Config> {
    return this._config;
  }

  constructor(initialConfig: Config = DefaultConfig) {
    this._config = initialConfig;
  }

  /**
   * Get a configuration value by dot-notation path
   * @example get('combat.critChance')
   */
  public get<K extends NestedKeyOf<Config>>(path: K): GetNestedType<Config, K> {
    return path
      .split(".")
      .reduce(
        (obj, key) => obj?.[key as keyof typeof obj],
        this._config as any
      );
  }

  /**
   * Reset configuration to default values
   */
  public reset(): void {
    this._config = DefaultConfig;
  }

  /**
   * Update configuration with partial values (deep merge)
   */
  public update(partialConfig: Partial<Config>): void {
    this._config = this.deepMerge(this._config, partialConfig);
  }

  /**
   * Load configuration from external source (e.g., file, localStorage)
   */
  public async load(loader: () => Promise<Partial<Config>>): Promise<void> {
    const loadedConfig = await loader();
    this.update(loadedConfig);
  }

  /**
   * Save configuration to external storage
   */
  public async save(saver: (config: Config) => Promise<void>): Promise<void> {
    await saver(this._config);
  }

  /**
   * Validate current configuration
   */
  public validate(): boolean {
    // Add your validation logic here
    return this._config.level.maxLevel <= 100;
  }

  /**
   * Deep merge two objects (simple implementation)
   */
  private deepMerge(target: any, source: any): any {
    if (typeof target !== "object" || typeof source !== "object") return source;

    for (const key of Object.keys(source)) {
      if (key === "__proto__" || key === "constructor") {
        continue; // Skip prototype-polluting keys
      }
      if (source[key] instanceof Object && key in target) {
        target[key] = this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  // For advanced validation, consider using JSON Schema or a validation library like Zod
}
