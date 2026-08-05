import { InMemoryProcurementRepository } from "@/lib/procurement/persistence/InMemoryProcurementRepository";
import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { TransactionManager } from "@/lib/persistence/services/shared";

/**
 * PostgreSQL Procurement persistence repository (Mission P-010.4).
 * Persistence is Map-wrapper driven via {@link ProcurementEntityPersister} on PlatformStore backing.
 */
export class PostgresProcurementRepository extends InMemoryProcurementRepository {
  readonly persistenceAdapter = "postgresql" as const;

  constructor(
    backing: ProcurementStoreBacking,
    private readonly connection: DatabaseConnection,
    private readonly transactionManager: TransactionManager,
  ) {
    super(backing);
    void this.connection;
    void this.transactionManager;
  }
}
