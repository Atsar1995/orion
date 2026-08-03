import "server-only";

import { InMemoryPeriodRepository } from "@/lib/finance/repositories/InMemoryPeriodRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import {
  FINANCE_COLLECTION_FISCAL_CALENDAR,
  FINANCE_COLLECTION_FISCAL_PERIOD,
  FINANCE_COLLECTION_FISCAL_YEAR,
} from "@/lib/platform/persistence/finance/FinanceEntityPersister";

const PERIOD_SELECT_BY_ID = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_FISCAL_PERIOD}'
    AND organization_id = $1
    AND entity_id = $2
  LIMIT 1
`;

const FISCAL_YEAR_SELECT = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_FISCAL_YEAR}'
    AND organization_id = $1
`;

const FISCAL_CALENDAR_SELECT = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_FISCAL_CALENDAR}'
    AND organization_id = $1
  LIMIT 1
`;

/**
 * PostgreSQL fiscal period repository (Mission P-009.13).
 * Persistence occurs through PlatformStore persisting map wrappers.
 */
export class PostgresPeriodRepository extends InMemoryPeriodRepository {
  readonly persistenceAdapter = "postgresql" as const;

  constructor(
    backing: FinanceStoreBacking,
    private readonly connection: DatabaseConnection,
    private readonly transactionManager: TransactionManager,
  ) {
    super(backing);
    void this.connection;
    void this.transactionManager;
    void PERIOD_SELECT_BY_ID;
    void FISCAL_YEAR_SELECT;
    void FISCAL_CALENDAR_SELECT;
  }
}
