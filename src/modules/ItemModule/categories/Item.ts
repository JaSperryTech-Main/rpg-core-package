import { TAttributes } from "@modules/AttributeModule";
import { TSocket } from "@modules/SocketModule";
import { IItem } from "../types";

export abstract class Item implements IItem {
  constructor(
    public readonly id: string,
    public name: string,
    public attributes?: TAttributes,
    public socket?: TSocket,
    public nickname?: string
  ) {}

  get displayName(): string {
    return this.nickname ?? this.name;
  }

  set displayName(nickname: string) {
    this.nickname = nickname;
  }

  // TODO: canEquip Logic
  // canEquip(player): boolean {}
}

// === Exports for Module === \\
export * from "./Armor/_index";
export * from "./Weapon/_index";
export * from "./Consumable/_index";
