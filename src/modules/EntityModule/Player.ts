import { Entity } from "./Entity";
import { TStats } from "./types";
import { TAttributes } from "@modules/AttributeModule";
import { defaultConfig } from "../../config";
import { Inventory } from "@src/modules/InventoryModule";

export class Player extends Entity {
  constructor(
    id: string,
    name: string,
    stats: TStats = {
      health: defaultConfig.stats.defaultHealth,
      maxHealth: defaultConfig.stats.defaultHealth,
      mana: defaultConfig.stats.defaultMana,
      maxMana: defaultConfig.stats.defaultMana,
    },
    attributes: TAttributes = {
      strength: defaultConfig.stats.defaultStrength,
      dexterity: defaultConfig.stats.defaultDexterity,
      intelligence: defaultConfig.stats.defaultIntelligence,
      vitality: defaultConfig.stats.defaultVitality,
    },
    public inventory = new Inventory()
  ) {
    super(id, name, { ...stats }, { ...attributes });
  }
}
