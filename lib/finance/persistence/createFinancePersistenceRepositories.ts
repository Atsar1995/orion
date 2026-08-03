import { ensureFinancePlatformBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { canUsePostgresFinancePersistence } from "@/lib/finance/persistence/financePostgresPersistence";
import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import { PostgresEventLineageRepository } from "@/lib/finance/persistence/PostgresEventLineageRepository";
import { PostgresJournalRepository } from "@/lib/finance/persistence/PostgresJournalRepository";
import type { EventLineageRepository } from "@/lib/finance/repositories/EventLineageRepository";
import type { JournalRepository } from "@/lib/finance/repositories/JournalRepository";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** P-009.7 persistence repository bundle — journal and event lineage. Master data uses {@link createFinanceRepositories}. */
export type FinancePersistenceRepositories = {
  readonly journalRepository: JournalRepository;
  readonly eventLineageRepository: EventLineageRepository;
};

export type CreateFinancePersistenceRepositoriesOptions = {
  readonly platformStore: PlatformStore;
  readonly connection?: DatabaseConnection;
};

/**
 * Builds P-009.7 Finance persistence repositories with PlatformStore integration.
 * Chart of accounts, fiscal periods, and idempotency keys persist through backing maps
 * wired in {@link createPostgresFinanceStore} and activate PostgreSQL adapters via
 * {@link createFinanceRepositories}.
 */
export function createFinancePersistenceRepositories(
  options: CreateFinancePersistenceRepositoriesOptions,
): FinancePersistenceRepositories {
  const backing = ensureFinancePlatformBacking(options.platformStore);
  const transactionManager = options.platformStore.getTransactionManager();

  if (canUsePostgresFinancePersistence(options.platformStore, options.connection)) {
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
