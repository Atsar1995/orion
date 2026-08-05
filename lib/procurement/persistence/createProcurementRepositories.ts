import { InMemoryProcurementRepository } from "@/lib/procurement/persistence/InMemoryProcurementRepository";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import { seedProcurementStore } from "@/lib/procurement/persistence/createProcurementStore";

/** Procurement repository bundle wired to a shared store backing (P-010.4). */
export type ProcurementRepositories = {
  readonly procurement: ProcurementPersistenceRepository;
  /** Supplier Management bounded context — shared persistence adapter. */
  readonly suppliers: ProcurementPersistenceRepository;
  /** Sourcing bounded context — shared persistence adapter. */
  readonly sourcing: ProcurementPersistenceRepository;
  /** Requisitioning bounded context — shared persistence adapter. */
  readonly requisitioning: ProcurementPersistenceRepository;
  /** Ordering bounded context — shared persistence adapter. */
  readonly ordering: ProcurementPersistenceRepository;
  /** Receiving bounded context — shared persistence adapter. */
  readonly receiving: ProcurementPersistenceRepository;
};

export type CreateProcurementRepositoriesOptions = {
  readonly procurementRepository?: ProcurementPersistenceRepository;
};

/**
 * Creates Procurement repository interfaces for a PlatformStore-backed wiring scope.
 * Bounded-context accessors share one persistence adapter until domain services ship (P-010.5+).
 */
export function createProcurementRepositories(
  store: ProcurementStoreBacking,
  options?: CreateProcurementRepositoriesOptions,
): ProcurementRepositories {
  seedProcurementStore(store);

  const repository =
    options?.procurementRepository ?? new InMemoryProcurementRepository(store);

  return {
    procurement: repository,
    suppliers: repository,
    sourcing: repository,
    requisitioning: repository,
    ordering: repository,
    receiving: repository,
  };
}
