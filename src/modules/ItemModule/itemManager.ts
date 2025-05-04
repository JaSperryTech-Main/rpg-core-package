import { Item } from "./categories/Item";

export class ItemManager<T extends Item = Item> {
  private items: Map<string, T> = new Map();

  add(item: T): void {
    if (this.items.has(item.id)) {
      throw new Error(`Item with ID ${item.id} already exists.`);
    }
    this.items.set(item.id, item);
  }

  get(id: string): Item | undefined {
    return this.items.get(id);
  }

  remove(id: string): void {
    this.items.delete(id);
  }

  list(): T[] {
    return Array.from(this.items.values());
  }
}
