import { Item } from "../Item";
import { TAttributes } from "@modules/AttributeModule";
import { TSocket } from "@modules/SocketModule";
import { ESlot } from "../../types";

export class Armor extends Item {
  constructor(
    id: string,
    name: string,
    attributes: TAttributes,
    socket: TSocket,
    public slot: ESlot,
    public setName?: string,
    nickname?: string
  ) {
    super(id, name, attributes, socket, nickname);
  }
}

// === Exports for Module === \\
export * from "./Shield";
