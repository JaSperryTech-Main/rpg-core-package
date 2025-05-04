import { Item } from "../Item";
import { TAttributes } from "@modules/AttributeModule";
import { TSocket } from "@modules/SocketModule";
import { ESlot } from "../../types";

export class Shield extends Item {
  constructor(
    id: string,
    name: string,
    attributes: TAttributes,
    socket: TSocket,
    public slot: ESlot.OFF_HAND,
    public setName?: string,
    nickname?: string
  ) {
    super(id, name, attributes, socket, nickname);
  }
}
