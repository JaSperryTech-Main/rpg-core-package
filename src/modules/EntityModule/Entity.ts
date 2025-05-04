import { IEntity, TStats } from "./types";
import { TAttributes } from "@modules/AttributeModule";

export abstract class Entity implements IEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public stats: TStats,
    public attributes: TAttributes
  ) {}

  isAlive(): boolean {
    return this.stats.health > 0;
  }

  takeDamage(amount: number): void {
    this.stats.health = Math.max(this.stats.health - amount, 0);
  }

  heal(amount: number): void {
    this.stats.health += amount;
  }

  clampStats(): void {
    this.stats.health = Math.min(this.stats.health, this.stats.maxHealth);
    this.stats.mana = Math.max(this.stats.mana, this.stats.maxMana);
  }
}
