import { ensureFinancePlatformBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import { PostgresEventLineageRepository } from "@/lib/finance/persistence/PostgresEventLineageRepository";
import { PostgresJournalRepository } from "@/lib/finance/persistence/PostgresJournalRepository";
import type { EventLineageRepository } from "@/lib/finance/repositories/EventLineageRepository";
import type { JournalRepository } from "@/lib/finance/repositories/JournalRepository";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import {
  StoreProvider,
  isStoreProviderImplemented,
} from "@/lib/platform/store/StoreConfiguration";

/** P-009.7 persistence repository bundle — journal and event lineage only. */
export type FinancePersistenceRepositories = {
  readonly journalRepository: JournalRepository;
  readonly eventLineageRepository: EventLineageRepository;
};

export type CreateFinancePersistenceRepositoriesOptions = {
  readonly platformStore: PlatformStore;
  readonly connection?: DatabaseConnection;
};

function isRelationalFinanceProvider(provider: StoreProvider): boolean {
  return provider === StoreProvider.PostgreSQL || provider === StoreProvider.SQLite;
}

function canUsePostgresPersistence(
  platformStore: PlatformStore,
  connection: DatabaseConnection | undefined,
): connection is DatabaseConnection {
  return (
    Boolean(connection) &&
    platformStore.isInitialized() &&
    isRelationalFinanceProvider(platformStore.provider) &&
    isStoreProviderImplemented(platformStore.provider)
  );
}

/**
 * Builds P-009.7 Finance persistence repositories with PlatformStore integration.
 * No business services — repository wiring only.
 */
export function createFinancePersistenceRepositories(
  options: CreateFinancePersistenceRepositoriesOptions,
): FinancePersistenceRepositories {
  const backing = ensureFinancePlatformBacking(options.platformStore);
  const transactionManager = options.platformStore.getTransactionManager();

  if (canUsePostgresPersistence(options.platformStore, options.connection)) {
    return {
      journalRepository: new PostgresJournalRepository(
        backing,
        options.connection,
        transactionManager,
      ),
      eventLineageRepository: new PostgresEventLineageRepository(
        backing,
        options.connection,
        transactionManager,
      ),
    };
  }

  return {
    journalRepository: new InMemoryJournalRepository(backing),
    eventLineageRepository: new InMemoryEventLineageRepository(backing),
  };
}
