import { TAttributes } from "@modules/AttributeModule";

export type TStats = {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
};

export interface IEntity {
  id: string;
  name: string;
  stats: TStats;
  attributes: TAttributes;
}
