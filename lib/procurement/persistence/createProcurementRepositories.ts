import { InMemoryProcurementRepository } from "@/lib/procurement/persistence/InMemoryProcurementRepository";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import { seedProcurementStore } from "@/lib/procurement/persistence/createProcurementStore";

/** Procurement repository bundle wired to a shared store backing. */
export type ProcurementRepositories = {
  readonly procurement: ProcurementPersistenceRepository;
};

export type CreateProcurementRepositoriesOptions = {
  readonly procurementRepository?: ProcurementPersistenceRepository;
};

/**
 * Creates Procurement domain repository interfaces for a PlatformStore-backed wiring scope.
 * Foundation phase exposes persistence repository only — no business services (P-010.3).
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
  };
}
