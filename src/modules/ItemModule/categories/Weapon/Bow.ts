import { Weapon } from "./_index";
import { TAttributes } from "@modules/AttributeModule";
import { TSocket } from "@modules/SocketModule";
import { ESlot } from "../../types";

export class Bow extends Weapon {
  constructor(
    id: string,
    name: string,
    attributes: TAttributes,
    socket: TSocket,
    public slot: ESlot.MAIN_HAND,
    public setName?: string,
    nickname?: string
  ) {
    super(id, name, attributes, socket, slot, setName, nickname);
  }
}
