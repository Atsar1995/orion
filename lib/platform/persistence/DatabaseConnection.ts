/**
 * Database connection contract (Mission P-015.5 · ADR-007).
 */

import type { PoolClient, QueryResult, QueryResultRow } from "pg";

export type DatabaseQueryResult<T extends QueryResultRow = QueryResultRow> = QueryResult<T>;

/** Connection pool statistics for health reporting. */
export type DatabasePoolStats = {
  readonly totalCount: number;
  readonly idleCount: number;
  readonly waitingCount: number;
};

/** Vendor-neutral database connection contract. */
export interface DatabaseConnection {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseQueryResult<T>>;
  acquireClient(): Promise<PoolClient>;
  releaseClient(client: PoolClient): void;
  ping(): Promise<boolean>;
  getPoolStats(): DatabasePoolStats;
  getServerVersion(): Promise<string | null>;
  shutdown(): Promise<void>;
  isConnected(): boolean;
}

export class DatabaseConnectionError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}
