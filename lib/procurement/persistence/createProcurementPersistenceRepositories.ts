import { ensureProcurementPlatformBacking } from "@/lib/procurement/persistence/ProcurementPlatformBacking";
import { canUsePostgresProcurementPersistence } from "@/lib/procurement/persistence/procurementPostgresPersistence";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { InMemoryProcurementRepository } from "@/lib/procurement/persistence/InMemoryProcurementRepository";
import { PostgresProcurementRepository } from "@/lib/procurement/persistence/PostgresProcurementRepository";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Procurement persistence repository bundle — shared backing aggregate access (Mission P-010.4). */
export type ProcurementPersistenceRepositories = {
  readonly procurementRepository: ProcurementPersistenceRepository;
};

export type CreateProcurementPersistenceRepositoriesOptions = {
  readonly platformStore: PlatformStore;
  readonly connection?: DatabaseConnection;
};

/**
 * Builds Procurement persistence repositories with PlatformStore integration.
 * Domain-facing repository interfaces resolve through {@link createProcurementRepositories}.
 */
export function createProcurementPersistenceRepositories(
  options: CreateProcurementPersistenceRepositoriesOptions,
): ProcurementPersistenceRepositories {
  const backing = ensureProcurementPlatformBacking(options.platformStore);
  const transactionManager = options.platformStore.getTransactionManager();

  if (canUsePostgresProcurementPersistence(options.platformStore, options.connection)) {
    return {
      procurementRepository: new PostgresProcurementRepository(
        backing,
        options.connection,
        transactionManager,
      ),
    };
  }

  return {
    procurementRepository: new InMemoryProcurementRepository(backing),
  };
}
