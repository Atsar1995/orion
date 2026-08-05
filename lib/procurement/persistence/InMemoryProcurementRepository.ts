import { getProcurementBackingCollection } from "@/lib/procurement/persistence/procurementBackingCollections";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import {
  PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION,
} from "@/lib/procurement/persistence/createProcurementStore";
import type {
  ProcurementAggregateRecord,
  ProcurementEntityRegistryEntry,
  ProcurementPersistenceCollection,
  ProcurementStoreBacking,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";

function idempotencyScopeKey(organizationId: string): string {
  return organizationId;
}

function entityRegistryKey(collection: string, entityId: string): string {
  return `${collection}::${entityId}`;
}

/**
 * In-memory Procurement persistence repository (Mission P-010.4).
 * Organization-scoped collection access — no business rules or validation.
 */
export class InMemoryProcurementRepository implements ProcurementPersistenceRepository {
  readonly domain = "procurement" as const;
  readonly persistenceAdapter?: "in-memory" | "postgresql" = "in-memory";
  readonly infrastructureVersion = PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION;

  constructor(private readonly backing: ProcurementStoreBacking) {}

  getById(
    organizationId: string,
    collection: ProcurementPersistenceCollection,
    entityId: string,
  ): ProcurementAggregateRecord | null {
    const record = getProcurementBackingCollection(this.backing, collection).get(entityId);
    if (!record || record.organizationId !== organizationId) {
      return null;
    }

    return record;
  }

  listByOrganization(
    organizationId: string,
    collection: ProcurementPersistenceCollection,
  ): readonly ProcurementAggregateRecord[] {
    return [...getProcurementBackingCollection(this.backing, collection).values()].filter(
      (record) => record.organizationId === organizationId,
    );
  }

  upsert(
    collection: ProcurementPersistenceCollection,
    record: ProcurementAggregateRecord,
  ): ProcurementAggregateRecord {
    getProcurementBackingCollection(this.backing, collection).set(record.id, record);
    this.registerEntity(collection, record.id, record.organizationId);
    return record;
  }

  remove(
    organizationId: string,
    collection: ProcurementPersistenceCollection,
    entityId: string,
  ): boolean {
    const existing = this.getById(organizationId, collection, entityId);
    if (!existing) {
      return false;
    }

    getProcurementBackingCollection(this.backing, collection).delete(entityId);
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
    const entry: ProcurementEntityRegistryEntry = {
      collection,
      entityId,
      organizationId,
      registeredAt: new Date().toISOString(),
    };

    this.backing.entityRegistry.set(entityRegistryKey(collection, entityId), entry);
  }
}
