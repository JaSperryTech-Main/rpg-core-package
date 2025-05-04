export const DefaultConfig = {
  general: {
    debugMode: false,
    randomSeed: null,
  },
  stats: {
    defaultHealth: 100,
    defaultMana: 50,
    defaultStrength: 0,
    defaultDexterity: 0,
    defaultIntelligence: 0,
    defaultVitality: 0,
  },
  level: {
    formula: (level: number) => Math.floor(100 * Math.pow(level, 1.5)),
    maxLevel: 100,
  },
  combat: {
    critChance: 0.1,
    critMultiplier: 1.5,
    damageVariance: 0.1,
  },
  inventory: {
    maxSlots: -1,
    weightLimit: -1,
  },
  equipment: {
    allowedSlots: ["head", "chest", "legs", "weapon", "accessory"],
  },
};
