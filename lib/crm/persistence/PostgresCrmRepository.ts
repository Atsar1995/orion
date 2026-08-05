import { InMemoryCrmRepository } from "@/lib/crm/persistence/InMemoryCrmRepository";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";

/**
 * PostgreSQL CRM persistence repository (Mission P-008.10 · P-008.17).
 * Persistence is Map-wrapper driven via {@link CrmEntityPersister} on PlatformStore backing.
 * Domain mutations on shared backing collections auto-queue upserts to `crm_entities`.
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
  }
}
