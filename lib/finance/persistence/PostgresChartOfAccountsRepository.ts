import "server-only";

import { InMemoryChartOfAccountsRepository } from "@/lib/finance/repositories/InMemoryChartOfAccountsRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import { FINANCE_COLLECTION_ACCOUNT } from "@/lib/platform/persistence/finance/FinanceEntityPersister";

const ACCOUNT_SELECT_BY_ID = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_ACCOUNT}'
    AND organization_id = $1
    AND entity_id = $2
  LIMIT 1
`;

/**
 * PostgreSQL Chart of Accounts repository (Mission P-009.13).
 * Persistence occurs through PlatformStore persisting map wrappers.
 */
export class PostgresChartOfAccountsRepository extends InMemoryChartOfAccountsRepository {
  readonly persistenceAdapter = "postgresql" as const;

  constructor(
    backing: FinanceStoreBacking,
    private readonly connection: DatabaseConnection,
    private readonly transactionManager: TransactionManager,
  ) {
    super(backing);
    void this.connection;
    void this.transactionManager;
    void ACCOUNT_SELECT_BY_ID;
  }
}
