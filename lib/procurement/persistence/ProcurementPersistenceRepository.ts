import type {
  ProcurementAggregateRecord,
  ProcurementPersistenceCollection,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";
import { PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION } from "@/lib/procurement/persistence/createProcurementStore";

/** Base Procurement persistence repository contract (Mission P-010.4). */
export type ProcurementPersistenceRepository = {
  readonly domain: "procurement";
  readonly persistenceAdapter?: "in-memory" | "postgresql";
  readonly infrastructureVersion: typeof PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION;
  getById(
    organizationId: string,
    collection: ProcurementPersistenceCollection,
    entityId: string,
  ): ProcurementAggregateRecord | null;
  listByOrganization(
    organizationId: string,
    collection: ProcurementPersistenceCollection,
  ): readonly ProcurementAggregateRecord[];
  upsert(
    collection: ProcurementPersistenceCollection,
    record: ProcurementAggregateRecord,
  ): ProcurementAggregateRecord;
  remove(
    organizationId: string,
    collection: ProcurementPersistenceCollection,
    entityId: string,
  ): boolean;
  registerIdempotencyKey(organizationId: string, key: string, value: string): void;
  getIdempotencyKey(organizationId: string, key: string): string | null;
  registerEntity(collection: string, entityId: string, organizationId: string): void;
};
