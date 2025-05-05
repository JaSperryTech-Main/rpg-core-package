import { Entity } from "./Entities";
import { logger } from "@utils/logger";
import path from "path";
import fs from "fs";

export class EntityManager<T extends Entity = Entity> {
  private entities: Map<string, T> = new Map();
  private types: Map<string, new () => T> = new Map();

  constructor() {
    logger.debug("Initializing EntityManager");
    logger.info("Reminder use await init() function");
  }

  async init() {
    logger.debug("Registering entity types");
    await this.registerEntityTypes();
    logger.debug(`Registered entity types: ${this.listTypes().join(", ")}`);
  }

  private async registerEntityTypes() {
    const entitiesPath = path.join(__dirname, "Entities");
    logger.debug(`Scanning for entity types in: ${entitiesPath}`);

    try {
      const files = fs.readdirSync(entitiesPath);
      logger.debug(`Found ${files.length} files in entities directory`);

      for (const file of files) {
        if (
          !file.endsWith(".ts") ||
          file === "Entity.ts" ||
          file === "index.ts"
        ) {
          logger.debug(`Skipping non-entity file: ${file}`);
          continue;
        }

        const filePath = path.join(entitiesPath, file);
        logger.debug(`Processing entity file: ${filePath}`);

        try {
          const module = await import(filePath);

          for (const exportKey in module) {
            const exported = module[exportKey];
            if (
              typeof exported === "function" &&
              exported.prototype instanceof Entity &&
              exported !== Entity
            ) {
              const typeName = exported.name;
              if (!this.types.has(typeName)) {
                logger.debug(`Registering entity type: ${typeName}`);
                this.types.set(typeName, exported);
              } else {
                logger.warn(
                  `Duplicate entity type registration attempted: ${typeName}`
                );
              }
            }
          }
        } catch (err) {
          logger.error(
            `Failed to load entity file ${filePath}:`,
            err instanceof Error ? err : new Error(String(err))
          );
        }
      }
    } catch (err) {
      logger.error(
        "Failed to scan entities directory:",
        err instanceof Error ? err : new Error(String(err))
      );
      throw new Error("Entity type registration failed");
    }
  }

  create(type: string, id: string): T {
    logger.debug(`Creating entity of type '${type}' with ID '${id}'`);

    const EntityConstructor = this.types.get(type);
    if (!EntityConstructor) {
      const error = new Error(`Entity type ${type} not registered`);
      logger.error(
        `${error.message} Available types: ${this.listTypes().join(", ")}`
      );
      throw error;
    }

    try {
      const entity = new EntityConstructor();
      entity.id = id;
      this.add(entity);
      logger.debug(`Successfully created entity: ${type} (${id})`);
      return entity;
    } catch (err) {
      logger.error(
        `Failed to create entity ${type} (${id}):`,
        err instanceof Error ? err : new Error(String(err))
      );
      throw err;
    }
  }

  add(entity: T): void {
    logger.debug(`Adding entity ${entity.id} (${entity.constructor.name})`);
    if (this.entities.has(entity.id)) {
      const error = new Error(`Entity with ID ${entity.id} already exists`);
      logger.warn(error.message, { existingEntity: entity.id });
      throw error;
    }
    this.entities.set(entity.id, entity);
    logger.debug(`Entity added successfully: ${entity.id}`);
  }

  get(id: string): T | undefined {
    logger.debug(`Fetching entity: ${id}`);
    const entity = this.entities.get(id);
    if (!entity) {
      logger.debug(`Entity not found: ${id}`);
    }
    return entity;
  }

  remove(id: string): void {
    logger.debug(`Removing entity: ${id}`);
    if (this.entities.delete(id)) {
      logger.debug(`Entity removed successfully: ${id}`);
    } else {
      logger.warn(`Attempted to remove non-existent entity: ${id}`);
    }
  }

  list(): T[] {
    logger.debug("Listing all entities");
    return Array.from(this.entities.values());
  }

  listTypes(): string[] {
    logger.debug("Listing registered entity types");
    return Array.from(this.types.keys());
  }
}
