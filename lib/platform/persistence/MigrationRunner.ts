/**
 * Platform migration runner — version tracking and rollback (Mission P-015.5 · ADR-007).
 */

import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  createMigrationContext,
  type AppliedMigrationVersion,
  type Migration,
  type MigrationExecutionRecord,
} from "@/lib/platform/persistence/Migration";
import {
  DEFAULT_PLATFORM_MIGRATIONS,
  MigrationRegistry,
} from "@/lib/platform/persistence/MigrationRegistry";
import type { MigrationSettings } from "@/lib/platform/persistence/PersistenceConfiguration";

export class MigrationRunnerError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "MigrationRunnerError";
  }
}

export type MigrationRunnerStatus = {
  readonly currentVersion: number;
  readonly latestVersion: number;
  readonly pendingCount: number;
  readonly upToDate: boolean;
};

/** Executes forward and rollback migrations with execution history. */
export class MigrationRunner {
  private readonly registry: MigrationRegistry;

  constructor(
    private readonly connection: DatabaseConnection,
    registry: MigrationRegistry = new MigrationRegistry(DEFAULT_PLATFORM_MIGRATIONS),
    private readonly settings: MigrationSettings = { autoRun: true, allowRollback: true },
  ) {
    this.registry = registry;
  }

  async getCurrentVersion(): Promise<number> {
    await this.ensureHistoryTableExists();
    const result = await this.connection.query<{ version: number | null }>(
      "SELECT MAX(version) AS version FROM platform_schema_version",
    );
    return result.rows[0]?.version ?? 0;
  }

  async getStatus(): Promise<MigrationRunnerStatus> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = this.registry.getLatestVersion();
    const pending = this.registry.getPending(currentVersion);

    return {
      currentVersion,
      latestVersion,
      pendingCount: pending.length,
      upToDate: pending.length === 0,
    };
  }

  async getAppliedVersions(): Promise<readonly AppliedMigrationVersion[]> {
    await this.ensureHistoryTableExists();
    const result = await this.connection.query<{
      version: number;
      migration_id: string;
      applied_at: string;
      checksum: string | null;
    }>(
      "SELECT version, migration_id, applied_at, checksum FROM platform_schema_version ORDER BY version ASC",
    );

    return result.rows.map((row) => ({
      version: row.version,
      migrationId: row.migration_id,
      appliedAt: row.applied_at,
      checksum: row.checksum ?? undefined,
    }));
  }

  async getExecutionHistory(limit = 50): Promise<readonly MigrationExecutionRecord[]> {
    await this.ensureHistoryTableExists();
    const result = await this.connection.query<{
      migration_id: string;
      version: number;
      direction: "up" | "down";
      status: "success" | "failure";
      executed_at: string;
      error_message: string | null;
    }>(
      `SELECT migration_id, version, direction, status, executed_at, error_message
       FROM platform_migration_history
       ORDER BY executed_at DESC
       LIMIT $1`,
      [limit],
    );

    return result.rows.map((row) => ({
      migrationId: row.migration_id,
      version: row.version,
      direction: row.direction,
      status: row.status,
      executedAt: row.executed_at,
      errorMessage: row.error_message ?? undefined,
    }));
  }

  async runPending(): Promise<readonly MigrationExecutionRecord[]> {
    const currentVersion = await this.getCurrentVersion();
    const pending = this.registry.getPending(currentVersion);
    const records: MigrationExecutionRecord[] = [];

    for (const migration of pending) {
      records.push(await this.applyUp(migration));
    }

    return records;
  }

  async rollback(steps = 1): Promise<readonly MigrationExecutionRecord[]> {
    if (!this.settings.allowRollback) {
      throw new MigrationRunnerError("Migration rollback is disabled by configuration.");
    }

    const currentVersion = await this.getCurrentVersion();
    const candidates = this.registry.getRollbackCandidates(currentVersion).slice(0, steps);
    const records: MigrationExecutionRecord[] = [];

    for (const migration of candidates) {
      records.push(await this.applyDown(migration));
    }

    return records;
  }

  private async applyUp(migration: Migration): Promise<MigrationExecutionRecord> {
    const context = createMigrationContext(this.connection);
    const executedAt = new Date().toISOString();

    try {
      await migration.up(context);
      await this.connection.query(
        `INSERT INTO platform_schema_version (version, migration_id, applied_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (version) DO UPDATE SET migration_id = EXCLUDED.migration_id, applied_at = NOW()`,
        [migration.version, migration.id],
      );
      await this.recordHistory(migration, "up", "success");
      return {
        migrationId: migration.id,
        version: migration.version,
        direction: "up",
        status: "success",
        executedAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown migration error";
      await this.recordHistory(migration, "up", "failure", message);
      throw new MigrationRunnerError(`Migration ${migration.id} failed.`, error);
    }
  }

  private async applyDown(migration: Migration): Promise<MigrationExecutionRecord> {
    const context = createMigrationContext(this.connection);
    const executedAt = new Date().toISOString();

    try {
      await migration.down(context);
      await this.connection.query("DELETE FROM platform_schema_version WHERE version = $1", [
        migration.version,
      ]);
      await this.recordHistory(migration, "down", "success");
      return {
        migrationId: migration.id,
        version: migration.version,
        direction: "down",
        status: "success",
        executedAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown migration error";
      await this.recordHistory(migration, "down", "failure", message);
      throw new MigrationRunnerError(`Rollback ${migration.id} failed.`, error);
    }
  }

  private async recordHistory(
    migration: Migration,
    direction: "up" | "down",
    status: "success" | "failure",
    errorMessage?: string,
  ): Promise<void> {
    await this.ensureHistoryTableExists();
    await this.connection.query(
      `INSERT INTO platform_migration_history
        (migration_id, version, direction, status, executed_at, error_message)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [migration.id, migration.version, direction, status, errorMessage ?? null],
    );
  }

  private async ensureHistoryTableExists(): Promise<void> {
    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS platform_schema_version (
        version INTEGER PRIMARY KEY,
        migration_id TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checksum TEXT
      )
    `);

    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS platform_migration_history (
        id SERIAL PRIMARY KEY,
        migration_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
        status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        error_message TEXT
      )
    `);
  }
}
