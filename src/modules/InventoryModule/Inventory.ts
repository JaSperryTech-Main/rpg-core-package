import { Item } from "@src/modules/ItemModule";

export class Inventory {
  private items: Map<string, Item> = new Map();

  constructor(private capacity?: number) {}

  get all(): Item[] {
    return Array.from(this.items.values());
  }

  // TODO: have itemId: string or number based off config
  has(itemId: string): boolean {
    return this.items.has(itemId);
  }

  hasCapacity(): boolean {
    if (this.capacity !== undefined && this.capacity >= 1) return true;
    return false;
  }

  add(item: Item): boolean {
    if (
      this.hasCapacity() &&
      this.capacity !== undefined &&
      this.items.size >= this.capacity
    ) {
      console.warn("Inventory is full.");
      return false;
    }

    if (this.items.has(item.id)) {
      console.warn(`Item with ID ${item.id} already exists.`);
      return false;
    }

    this.items.set(item.id, item);
    return true;
  }

  remove(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  get(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }

  clear(): void {
    this.items.clear();
  }

  findByName(name: string): Item[] {
    return this.all.filter(
      (item) => item.name === name || item.displayName === name
    );
  }
}
