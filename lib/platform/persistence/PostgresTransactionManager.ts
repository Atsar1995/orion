/**
 * PostgreSQL transaction manager for PlatformStore (Mission P-015.5 · ADR-007).
 */

import { randomUUID } from "crypto";
import type { PoolClient } from "pg";
import type {
  PersistenceTransaction,
  TransactionManager,
} from "@/lib/persistence/services/shared";
import type { RepositoryResult } from "@/types/persistence";
import { PersistenceErrorCode } from "@/types/persistence";
import { failure, success } from "@/lib/persistence/result";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { HcmEntityPersister } from "@/lib/platform/persistence/hcm/HcmEntityPersister";
import type { FinanceEntityPersister } from "@/lib/platform/persistence/finance/FinanceEntityPersister";

export type PostgresPersistenceTransaction = PersistenceTransaction & {
  readonly client: PoolClient;
};

export class PostgresTransactionManager implements TransactionManager {
  private readonly activeTransactions = new Map<string, PostgresPersistenceTransaction>();

  constructor(
    private readonly connection: DatabaseConnection,
    private readonly hcmPersister?: HcmEntityPersister,
    private readonly financePersister?: FinanceEntityPersister,
  ) {}

  async beginTransaction(): Promise<RepositoryResult<PersistenceTransaction>> {
    try {
      const client = await this.connection.acquireClient();
      await client.query("BEGIN");
      this.hcmPersister?.beginTransaction();
      this.financePersister?.beginTransaction();

      const transaction: PostgresPersistenceTransaction = {
        transactionId: randomUUID(),
        client,
      };
      this.activeTransactions.set(transaction.transactionId, transaction);
      return success(transaction);
    } catch (error) {
      return failure({
        code: PersistenceErrorCode.Storage,
        message: error instanceof Error ? error.message : "Failed to begin transaction.",
      });
    }
  }

  async commit(transaction: PersistenceTransaction): Promise<RepositoryResult<void>> {
    const active = this.resolveTransaction(transaction);

    if (!active) {
      return failure({
        code: PersistenceErrorCode.Unknown,
        message: "Transaction handle is invalid or expired.",
      });
    }

    try {
      await this.hcmPersister?.flushPending();
      await this.financePersister?.flushPending();
      await active.client.query("COMMIT");
      return success(undefined);
    } catch (error) {
      await active.client.query("ROLLBACK");
      return failure({
        code: PersistenceErrorCode.Storage,
        message: error instanceof Error ? error.message : "Failed to commit transaction.",
      });
    } finally {
      this.connection.releaseClient(active.client);
      this.activeTransactions.delete(active.transactionId);
      this.hcmPersister?.endTransaction();
      this.financePersister?.endTransaction();
    }
  }

  async rollback(transaction: PersistenceTransaction): Promise<RepositoryResult<void>> {
    const active = this.resolveTransaction(transaction);

    if (!active) {
      return failure({
        code: PersistenceErrorCode.Unknown,
        message: "Transaction handle is invalid or expired.",
      });
    }

    try {
      await active.client.query("ROLLBACK");
      this.hcmPersister?.discardPending();
      this.financePersister?.discardPending();
      return success(undefined);
    } catch (error) {
      return failure({
        code: PersistenceErrorCode.Storage,
        message: error instanceof Error ? error.message : "Failed to rollback transaction.",
      });
    } finally {
      this.connection.releaseClient(active.client);
      this.activeTransactions.delete(active.transactionId);
      this.hcmPersister?.endTransaction();
      this.financePersister?.endTransaction();
    }
  }

  private resolveTransaction(
    transaction: PersistenceTransaction,
  ): PostgresPersistenceTransaction | undefined {
    return this.activeTransactions.get(transaction.transactionId);
  }
}
