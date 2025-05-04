import { Entity } from "./Entity";
import { TStats } from "./types";
import { TAttributes } from "@modules/AttributeModule";
import { DefaultConfig } from "@modules/ConfigModule";
import { Inventory } from "@src/modules/InventoryModule";

export class Player extends Entity {
  constructor(
    id: string,
    name: string,
    stats: TStats = {
      health: DefaultConfig.stats.defaultHealth,
      maxHealth: DefaultConfig.stats.defaultHealth,
      mana: DefaultConfig.stats.defaultMana,
      maxMana: DefaultConfig.stats.defaultMana,
    },
    attributes: TAttributes = {
      strength: DefaultConfig.stats.defaultStrength,
      dexterity: DefaultConfig.stats.defaultDexterity,
      intelligence: DefaultConfig.stats.defaultIntelligence,
      vitality: DefaultConfig.stats.defaultVitality,
    },
    public inventory = new Inventory()
  ) {
    super(id, name, { ...stats }, { ...attributes });
  }
}
