import { defaultConfig, Config } from "./defaultConfig";

let customOverrides: Partial<Config> = {};

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === "object" && !Array.isArray(item);
}

function deepMerge<T>(target: T, source?: Partial<T>): T {
  if (!source) return target;

  const result: any = { ...target };

  for (const key in source) {
    if (isObject(source[key]) && isObject(target[key])) {
      result[key] = deepMerge(target[key] as any, source[key] as any);
    } else if (Array.isArray(target[key]) && Array.isArray(source[key])) {
      result[key] = [...target[key], ...source[key]];
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

export const ConfigManager = {
  get config() {
    return deepMerge(defaultConfig, customOverrides);
  },
  override(newConfig: Partial<Config>): Config {
    customOverrides = deepMerge(customOverrides, newConfig);
    return ConfigManager.config;
  },
  validate(): boolean {
    const config = ConfigManager.config;

    if (typeof config.stats.defaultHealth !== "number") {
      throw new Error("defaultHealth must be a number!");
    }

    return true;
  },
  reset(): void {
    customOverrides = {};
  },
};
