import { Entity } from "./Entity";

export class EntityManager<T extends Entity = Entity> {
  private entities: Map<string, T> = new Map();

  add(entity: T): void {
    if (this.entities.has(entity.id)) {
      throw new Error(`Entity with ID ${entity.id} already exists.`);
    }
    this.entities.set(entity.id, entity);
  }

  get(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  remove(id: string): void {
    this.entities.delete(id);
  }

  list(): T[] {
    return Array.from(this.entities.values());
  }
}
