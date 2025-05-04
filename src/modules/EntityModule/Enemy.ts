import { Entity } from "./Entity";
import { TStats } from "./types";
import { TAttributes } from "@modules/AttributeModule";

export class Enemy extends Entity {
  constructor(
    id: string,
    name: string,
    stats: TStats,
    attributes: TAttributes
  ) {
    super(id, name, stats, attributes);
  }
}
