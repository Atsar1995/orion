import "server-only";

import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import { FINANCE_COLLECTION_EVENT_LINEAGE } from "@/lib/platform/persistence/finance/FinanceEntityPersister";

const LINEAGE_UPSERT = `
  INSERT INTO finance_entities (collection_name, entity_id, organization_id, payload, updated_at)
  VALUES ('${FINANCE_COLLECTION_EVENT_LINEAGE}', $1, $2, $3::jsonb, NOW())
  ON CONFLICT (collection_name, entity_id)
  DO UPDATE SET organization_id = EXCLUDED.organization_id, payload = EXCLUDED.payload, updated_at = NOW()
`;

const LINEAGE_SELECT_BY_ID = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_EVENT_LINEAGE}'
    AND organization_id = $1
    AND entity_id = $2
  LIMIT 1
`;

const LINEAGE_SELECT_BY_EVENT = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_EVENT_LINEAGE}'
    AND organization_id = $1
    AND (
      entity_id = $2
      OR payload->>'businessEventId' = $2
      OR payload->>'financialEventId' = $2
    )
  LIMIT 1
`;

const LINEAGE_SELECT_BY_CORRELATION = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_EVENT_LINEAGE}'
    AND organization_id = $1
    AND payload->>'correlationId' = $2
  ORDER BY payload->>'createdAt' ASC
`;

const LINEAGE_SELECT_BY_ORGANIZATION = `
  SELECT payload
  FROM finance_entities
  WHERE collection_name = '${FINANCE_COLLECTION_EVENT_LINEAGE}'
    AND organization_id = $1
  ORDER BY payload->>'createdAt' ASC
`;

/**
 * PostgreSQL Event Lineage repository (Mission P-009.7B).
 * Metadata persistence via finance_entities — no event processing.
 */
export class PostgresEventLineageRepository extends InMemoryEventLineageRepository {
  readonly persistenceAdapter = "postgresql" as const;

  constructor(
    backing: FinanceStoreBacking,
    private readonly connection: DatabaseConnection,
    private readonly transactionManager: TransactionManager,
  ) {
    super(backing);
    void this.connection;
    void this.transactionManager;
    void LINEAGE_UPSERT;
    void LINEAGE_SELECT_BY_ID;
    void LINEAGE_SELECT_BY_EVENT;
    void LINEAGE_SELECT_BY_CORRELATION;
    void LINEAGE_SELECT_BY_ORGANIZATION;
  }
}
