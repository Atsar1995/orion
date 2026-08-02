import "server-only";

/**
 * PostgreSQL connection pool — server runtime only (Mission P-015.5 · ADR-007).
 */

import type { Pool, PoolClient, QueryResultRow } from "pg";
import {
  DatabaseConnectionError,
  type DatabaseConnection,
  type DatabasePoolStats,
  type DatabaseQueryResult,
} from "@/lib/platform/persistence/DatabaseConnection";
import type {
  DatabasePoolSettings,
  DatabaseRetrySettings,
  PersistenceConfiguration,
} from "@/lib/platform/persistence/PersistenceConfiguration";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;
  return (
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "57P01" ||
    code === "57P03" ||
    error.message.includes("Connection terminated")
  );
}

/** PostgreSQL connection pool with retry and graceful shutdown. */
export class PostgresDatabaseConnection implements DatabaseConnection {
  private pool: Pool | null = null;
  private readonly retry: DatabaseRetrySettings;
  private connected = false;
  private serverVersion: string | null = null;

  constructor(
    private readonly databaseUrl: string,
    private readonly poolSettings: DatabasePoolSettings,
    retrySettings: DatabaseRetrySettings,
  ) {
    this.retry = retrySettings;
  }

  static fromConfiguration(config: PersistenceConfiguration): PostgresDatabaseConnection {
    const databaseUrl = config.store.databaseUrl;
    if (!databaseUrl) {
      throw new DatabaseConnectionError(
        "ORION_DATABASE_URL is required for PostgreSQL persistence.",
      );
    }

    return new PostgresDatabaseConnection(databaseUrl, config.pool, config.retry);
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseQueryResult<T>> {
    const pool = await this.ensurePool();
    return this.executeWithRetry(() => pool.query<T>(sql, params));
  }

  async acquireClient(): Promise<PoolClient> {
    const pool = await this.ensurePool();
    return this.executeWithRetry(() => pool.connect());
  }

  releaseClient(client: PoolClient): void {
    client.release();
  }

  async ping(): Promise<boolean> {
    try {
      await this.query("SELECT 1 AS ok");
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  getPoolStats(): DatabasePoolStats {
    if (!this.pool) {
      return { totalCount: 0, idleCount: 0, waitingCount: 0 };
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  async getServerVersion(): Promise<string | null> {
    if (this.serverVersion) {
      return this.serverVersion;
    }

    try {
      const result = await this.query<{ version: string }>("SHOW server_version");
      this.serverVersion = result.rows[0]?.version ?? null;
      return this.serverVersion;
    } catch {
      return null;
    }
  }

  async shutdown(): Promise<void> {
    this.connected = false;
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private async ensurePool(): Promise<Pool> {
    if (this.pool) {
      return this.pool;
    }

    const { Pool } = await import("pg");
    this.pool = new Pool({
      connectionString: this.databaseUrl,
      min: this.poolSettings.minConnections,
      max: this.poolSettings.maxConnections,
      connectionTimeoutMillis: this.poolSettings.connectTimeoutMs,
      idleTimeoutMillis: this.poolSettings.idleTimeoutMs,
      query_timeout: this.poolSettings.queryTimeoutMs,
    });
    return this.pool;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.retry.maxAttempts; attempt += 1) {
      try {
        const result = await operation();
        this.connected = true;
        return result;
      } catch (error) {
        lastError = error;
        this.connected = false;

        if (attempt >= this.retry.maxAttempts || !isRetryableError(error)) {
          break;
        }

        await delay(this.retry.delayMs * attempt);
      }
    }

    throw new DatabaseConnectionError(
      "Database operation failed after retries.",
      lastError,
    );
  }
}
