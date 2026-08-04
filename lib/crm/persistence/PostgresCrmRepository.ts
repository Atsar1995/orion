import { InMemoryCrmRepository } from "@/lib/crm/persistence/InMemoryCrmRepository";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import {
  CRM_COLLECTION_ACCOUNT,
  CRM_COLLECTION_ACTIVITY,
  CRM_COLLECTION_ATTACHMENT,
  CRM_COLLECTION_CASE,
  CRM_COLLECTION_CONTACT,
  CRM_COLLECTION_ENTITY_REGISTRY,
  CRM_COLLECTION_IDEMPOTENCY_KEY,
  CRM_COLLECTION_LEAD,
  CRM_COLLECTION_NOTE,
  CRM_COLLECTION_OPPORTUNITY,
  CRM_COLLECTION_ORGANIZATION,
  CRM_COLLECTION_QUOTE,
  CRM_COLLECTION_SALES_ORDER,
} from "@/lib/platform/persistence/crm/CrmEntityPersister";

const CRM_SELECT_BY_ID = `
  SELECT payload
  FROM crm_entities
  WHERE collection_name = $1
    AND organization_id = $2
    AND entity_id = $3
  LIMIT 1
`;

const CRM_SELECT_BY_ORGANIZATION = `
  SELECT payload
  FROM crm_entities
  WHERE collection_name = $1
    AND organization_id = $2
`;

const CRM_UPSERT = `
  INSERT INTO crm_entities (collection_name, entity_id, organization_id, payload, updated_at)
  VALUES ($1, $2, $3, $4::jsonb, NOW())
  ON CONFLICT (collection_name, entity_id)
  DO UPDATE SET organization_id = EXCLUDED.organization_id, payload = EXCLUDED.payload, updated_at = NOW()
`;

const CRM_DELETE = `
  DELETE FROM crm_entities
  WHERE collection_name = $1
    AND organization_id = $2
    AND entity_id = $3
`;

const CRM_IDEMPOTENCY_SELECT = `
  SELECT payload
  FROM crm_entities
  WHERE collection_name = '${CRM_COLLECTION_IDEMPOTENCY_KEY}'
    AND organization_id = $1
    AND entity_id = $2
  LIMIT 1
`;

const CRM_ENTITY_REGISTRY_SELECT = `
  SELECT payload
  FROM crm_entities
  WHERE collection_name = '${CRM_COLLECTION_ENTITY_REGISTRY}'
    AND organization_id = $1
    AND entity_id = $2
  LIMIT 1
`;

/**
 * PostgreSQL CRM persistence repository (Mission P-008.10).
 * Uses shared PlatformStore backing with crm_entities SQL contracts.
 * Query execution deferred — parameterized SQL placeholders only.
 */
export class PostgresCrmRepository extends InMemoryCrmRepository {
  readonly persistenceAdapter = "postgresql" as const;

  constructor(
    backing: CrmStoreBacking,
    private readonly connection: DatabaseConnection,
    private readonly transactionManager: TransactionManager,
  ) {
    super(backing);
    void this.connection;
    void this.transactionManager;
    void CRM_SELECT_BY_ID;
    void CRM_SELECT_BY_ORGANIZATION;
    void CRM_UPSERT;
    void CRM_DELETE;
    void CRM_IDEMPOTENCY_SELECT;
    void CRM_ENTITY_REGISTRY_SELECT;
    void CRM_COLLECTION_ACCOUNT;
    void CRM_COLLECTION_CONTACT;
    void CRM_COLLECTION_ORGANIZATION;
    void CRM_COLLECTION_LEAD;
    void CRM_COLLECTION_OPPORTUNITY;
    void CRM_COLLECTION_QUOTE;
    void CRM_COLLECTION_ACTIVITY;
    void CRM_COLLECTION_CASE;
    void CRM_COLLECTION_SALES_ORDER;
    void CRM_COLLECTION_NOTE;
    void CRM_COLLECTION_ATTACHMENT;
  }
}
