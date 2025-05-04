export const defaultConfig = {
  stats: {
    defaultHealth: 100,
    defaultMana: 50,
    defaultStrength: 10,
    defaultDexterity: 10,
    defaultIntelligence: 10,
    defaultVitality: 5,
    statCap: 999,
  },

  levelCurve: {
    formula: (level: number) => Math.floor(100 * Math.pow(level, 1.5)),
    maxLevel: 100,
  },

  combat: {
    baseHitChance: 0.85,
    critChance: 0.1,
    critMultiplier: 1.5,
    evasionPerAgility: 0.01,
    damageVariance: 0.1, // 10% random variance
  },

  inventory: {
    maxSlots: 30,
    weightLimit: 300,
  },

  equipment: {
    allowedSlots: ["head", "chest", "legs", "weapon", "accessory"],
    defaultDurability: 100,
  },

  general: {
    debugMode: false,
    randomSeed: null, // Optional seeded randomness
  },
};

export type Config = typeof defaultConfig;
