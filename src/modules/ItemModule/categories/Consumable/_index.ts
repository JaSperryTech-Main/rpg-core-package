import { Item } from "../Item";

export class Consumable extends Item {
  constructor(id: string, name: string, public duration: number) {
    super(id, name);
  }

  effect(player: any) {
    //TODO: Add Effect Logic
  }
}
