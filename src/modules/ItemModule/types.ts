import { TSocket } from "@modules/SocketModule";
import { TAttributes } from "@modules/AttributeModule";

export enum ESlot {
  HELMET = "helmet",
  CHESTPLATE = "chestplate",
  LEGGINGS = "leggings",
  BOOTS = "boots",
  GLOVES = "Gloves",
  MAIN_HAND = "Main Hand",
  OFF_HAND = "Off Hand",
  RING = "Ring",
  NECKLACE = "Necklace",
}

export interface IItem {
  id: string;
  name: string;
  socket?: TSocket;
  attributes?: TAttributes;
  nickname?: string;
}
