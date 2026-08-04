import { ensureCrmPlatformBacking } from "@/lib/crm/persistence/CrmPlatformBacking";
import { canUsePostgresCrmPersistence } from "@/lib/crm/persistence/crmPostgresPersistence";
import type { CrmPersistenceRepository } from "@/lib/crm/persistence/CrmPersistenceRepository";
import { InMemoryCrmRepository } from "@/lib/crm/persistence/InMemoryCrmRepository";
import { PostgresCrmRepository } from "@/lib/crm/persistence/PostgresCrmRepository";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** CRM persistence repository bundle — shared backing aggregate access (Mission P-008.10). */
export type CrmPersistenceRepositories = {
  readonly crmRepository: CrmPersistenceRepository;
};

export type CreateCrmPersistenceRepositoriesOptions = {
  readonly platformStore: PlatformStore;
  readonly connection?: DatabaseConnection;
};

/**
 * Builds CRM persistence repositories with PlatformStore integration.
 * Domain-facing repository interfaces resolve through {@link createCrmRepositories}.
 */
export function createCrmPersistenceRepositories(
  options: CreateCrmPersistenceRepositoriesOptions,
): CrmPersistenceRepositories {
  const backing = ensureCrmPlatformBacking(options.platformStore);
  const transactionManager = options.platformStore.getTransactionManager();

  if (canUsePostgresCrmPersistence(options.platformStore, options.connection)) {
    return {
      crmRepository: new PostgresCrmRepository(
        backing,
        options.connection,
        transactionManager,
      ),
    };
  }

  return {
    crmRepository: new InMemoryCrmRepository(backing),
  };
}
