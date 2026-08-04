import type { CrmAggregateRecord, CrmPersistenceCollection } from "@/lib/crm/persistence/CrmStoreBacking";

/** Base CRM persistence repository contract (Mission P-008.10). */
export type CrmPersistenceRepository = {
  readonly domain: "crm";
  readonly persistenceAdapter?: "in-memory" | "postgresql";
  getById(
    organizationId: string,
    collection: CrmPersistenceCollection,
    entityId: string,
  ): CrmAggregateRecord | null;
  listByOrganization(
    organizationId: string,
    collection: CrmPersistenceCollection,
  ): readonly CrmAggregateRecord[];
  upsert(collection: CrmPersistenceCollection, record: CrmAggregateRecord): CrmAggregateRecord;
  remove(
    organizationId: string,
    collection: CrmPersistenceCollection,
    entityId: string,
  ): boolean;
  registerIdempotencyKey(organizationId: string, key: string, value: string): void;
  getIdempotencyKey(organizationId: string, key: string): string | null;
  registerEntity(collection: string, entityId: string, organizationId: string): void;
};
