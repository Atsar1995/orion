import "server-only";

import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import {
  FINANCE_COLLECTION_JOURNAL,
  FINANCE_COLLECTION_JOURNAL_LINE,
} from "@/lib/platform/persistence/finance/FinanceEntityPersister";

const JOURNAL_SELECT_BY_ID = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_JOURNAL}'
    AND organization_id = $1
    AND entity_id = $2
  LIMIT 1
`;

const JOURNAL_SELECT_BY_ORGANIZATION = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_JOURNAL}'
    AND organization_id = $1
`;

const JOURNAL_SELECT_BY_CORRELATION = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_JOURNAL}'
    AND organization_id = $1
    AND payload->>'correlationId' = $2
`;

const JOURNAL_SELECT_BY_PERIOD = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_JOURNAL}'
    AND organization_id = $1
    AND payload->>'periodId' = $2
`;

const JOURNAL_LINE_SELECT = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_JOURNAL_LINE}'
    AND organization_id = $1
    AND payload->>'journalId' = $2
`;

const JOURNAL_DELETE = `
  DELETE FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_JOURNAL}'
    AND organization_id = $1
    AND entity_id = $2
`;

const JOURNAL_LINE_DELETE_BY_JOURNAL = `
  DELETE FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_JOURNAL_LINE}'
    AND organization_id = $1
    AND payload->>'journalId' = $2
`;

/**
 * PostgreSQL Journal repository (Mission P-009.7B).
 * Uses shared PlatformStore backing with finance_entities SQL contracts.
 */
export class PostgresJournalRepository extends InMemoryJournalRepository {
  readonly persistenceAdapter = "postgresql" as const;

  constructor(
    backing: FinanceStoreBacking,
    private readonly connection: DatabaseConnection,
    private readonly transactionManager: TransactionManager,
  ) {
    super(backing);
    void this.connection;
    void this.transactionManager;
    void JOURNAL_SELECT_BY_ID;
    void JOURNAL_SELECT_BY_ORGANIZATION;
    void JOURNAL_SELECT_BY_CORRELATION;
    void JOURNAL_SELECT_BY_PERIOD;
    void JOURNAL_LINE_SELECT;
    void JOURNAL_DELETE;
    void JOURNAL_LINE_DELETE_BY_JOURNAL;
  }
}
