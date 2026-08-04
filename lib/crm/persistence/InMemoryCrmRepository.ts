import { getCrmBackingCollection } from "@/lib/crm/persistence/crmBackingCollections";
import type { CrmPersistenceRepository } from "@/lib/crm/persistence/CrmPersistenceRepository";
import type {
  CrmAggregateRecord,
  CrmEntityRegistryEntry,
  CrmPersistenceCollection,
  CrmStoreBacking,
} from "@/lib/crm/persistence/CrmStoreBacking";

function idempotencyScopeKey(organizationId: string): string {
  return organizationId;
}

function entityRegistryKey(collection: string, entityId: string): string {
  return `${collection}::${entityId}`;
}

/**
 * In-memory CRM persistence repository (Mission P-008.10).
 * Organization-scoped collection access — no business rules or validation.
 */
export class InMemoryCrmRepository implements CrmPersistenceRepository {
  readonly domain = "crm" as const;
  readonly persistenceAdapter?: "in-memory" | "postgresql" = "in-memory";

  constructor(private readonly backing: CrmStoreBacking) {}

  getById(
    organizationId: string,
    collection: CrmPersistenceCollection,
    entityId: string,
  ): CrmAggregateRecord | null {
    const record = getCrmBackingCollection(this.backing, collection).get(entityId);
    if (!record || record.organizationId !== organizationId) {
      return null;
    }

    return record;
  }

  listByOrganization(
    organizationId: string,
    collection: CrmPersistenceCollection,
  ): readonly CrmAggregateRecord[] {
    return [...getCrmBackingCollection(this.backing, collection).values()].filter(
      (record) => record.organizationId === organizationId,
    );
  }

  upsert(collection: CrmPersistenceCollection, record: CrmAggregateRecord): CrmAggregateRecord {
    getCrmBackingCollection(this.backing, collection).set(record.id, record);
    this.registerEntity(collection, record.id, record.organizationId);
    return record;
  }

  remove(
    organizationId: string,
    collection: CrmPersistenceCollection,
    entityId: string,
  ): boolean {
    const existing = this.getById(organizationId, collection, entityId);
    if (!existing) {
      return false;
    }

    getCrmBackingCollection(this.backing, collection).delete(entityId);
    this.backing.entityRegistry.delete(entityRegistryKey(collection, entityId));
    return true;
  }

  registerIdempotencyKey(organizationId: string, key: string, value: string): void {
    const scope = idempotencyScopeKey(organizationId);
    const bucket = this.backing.idempotencyKeys.get(scope) ?? {};
    this.backing.idempotencyKeys.set(scope, { ...bucket, [key]: value });
  }

  getIdempotencyKey(organizationId: string, key: string): string | null {
    const bucket = this.backing.idempotencyKeys.get(idempotencyScopeKey(organizationId));
    return bucket?.[key] ?? null;
  }

  registerEntity(collection: string, entityId: string, organizationId: string): void {
    const entry: CrmEntityRegistryEntry = {
      collection,
      entityId,
      organizationId,
      registeredAt: new Date().toISOString(),
    };

    this.backing.entityRegistry.set(entityRegistryKey(collection, entityId), entry);
  }
}
