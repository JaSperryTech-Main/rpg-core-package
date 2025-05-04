// modules/attributes/Attributes.ts

import { AttributeSource, TAttributes } from "./types";

export function createEmptyAttributes(keys: string[]): TAttributes {
  return keys.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as TAttributes);
}

export function calculateFinalAttributes(source: AttributeSource): TAttributes {
  const allKeys = new Set<string>({
    ...Object.keys(source.base),
    ...Object.keys(source.bonus ?? {}),
    ...Object.keys(source.percentBonus ?? {}),
  });

  const result: TAttributes = {};

  for (const key of allKeys) {
    const base = source.base[key] ?? 0;
    const flat = source.bonus?.[key] ?? 0;
    const percent = source.percentBonus?.[key] ?? 0;
    result[key] = Math.floor((base + flat) * (1 + percent / 100));
  }

  return result;
}
