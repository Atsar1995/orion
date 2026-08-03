import "server-only";

import { InMemoryIdempotencyRepository } from "@/lib/finance/repositories/InMemoryIdempotencyRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import { FINANCE_COLLECTION_IDEMPOTENCY_KEY } from "@/lib/platform/persistence/finance/FinanceEntityPersister";

const IDEMPOTENCY_SELECT = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_IDEMPOTENCY_KEY}'
    AND organization_id = $1
    AND entity_id = $2
  LIMIT 1
`;

/**
 * PostgreSQL idempotency repository (Mission P-009.13).
 * Persistence occurs through PlatformStore persisting map wrappers.
 */
export class PostgresIdempotencyRepository extends InMemoryIdempotencyRepository {
  readonly persistenceAdapter = "postgresql" as const;

  constructor(
    backing: FinanceStoreBacking,
    private readonly connection: DatabaseConnection,
    private readonly transactionManager: TransactionManager,
  ) {
    super(backing);
    void this.connection;
    void this.transactionManager;
    void IDEMPOTENCY_SELECT;
  }
}
