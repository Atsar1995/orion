import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  createMigrationContext,
  type AppliedMigrationVersion,
  type MigrationExecutionRecord,
} from "@/lib/platform/persistence/Migration";
import {
  AuroraMigrationRegistry,
  AURORA_ADMIN_MIGRATIONS,
} from "@/lib/aurora/persistence/AuroraMigrationRegistry";

export class AuroraMigrationRunnerError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "AuroraMigrationRunnerError";
  }
}

export type AuroraMigrationRunnerStatus = {
  readonly currentVersion: number;
  readonly latestVersion: number;
  readonly pendingCount: number;
  readonly upToDate: boolean;
};

/** Executes Aurora SQL migrations tracked in aurora_schema_version (ADR-001). */
export class AuroraMigrationRunner {
  private readonly registry: AuroraMigrationRegistry;

  constructor(
    private readonly connection: DatabaseConnection,
    registry: AuroraMigrationRegistry = new AuroraMigrationRegistry(AURORA_ADMIN_MIGRATIONS),
  ) {
    this.registry = registry;
  }

  async getCurrentVersion(): Promise<number> {
    await this.ensureHistoryTableExists();
    const result = await this.connection.query<{ version: number | null }>(
      "SELECT MAX(version) AS version FROM aurora_schema_version",
    );
    return result.rows[0]?.version ?? 0;
  }

  async getStatus(): Promise<AuroraMigrationRunnerStatus> {
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
      "SELECT version, migration_id, applied_at, checksum FROM aurora_schema_version ORDER BY version ASC",
    );

    return result.rows.map((row) => ({
      version: row.version,
      migrationId: row.migration_id,
      appliedAt: row.applied_at,
      checksum: row.checksum ?? undefined,
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

  private async applyUp(
    migration: (typeof AURORA_ADMIN_MIGRATIONS)[number],
  ): Promise<MigrationExecutionRecord> {
    const context = createMigrationContext(this.connection);
    const executedAt = new Date().toISOString();

    try {
      await migration.up(context);
      await this.connection.query(
        `INSERT INTO aurora_schema_version (version, migration_id, applied_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (version) DO UPDATE SET migration_id = EXCLUDED.migration_id, applied_at = NOW()`,
        [migration.version, migration.id],
      );
      await this.recordHistory(migration.id, migration.version, "up", "success");
      return {
        migrationId: migration.id,
        version: migration.version,
        direction: "up",
        status: "success",
        executedAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown migration error";
      await this.recordHistory(migration.id, migration.version, "up", "failure", message);
      throw new AuroraMigrationRunnerError(`Aurora migration ${migration.id} failed.`, error);
    }
  }

  private async recordHistory(
    migrationId: string,
    version: number,
    direction: "up" | "down",
    status: "success" | "failure",
    errorMessage?: string,
  ): Promise<void> {
    await this.ensureHistoryTableExists();
    await this.connection.query(
      `INSERT INTO aurora_migration_history
        (migration_id, version, direction, status, executed_at, error_message)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [migrationId, version, direction, status, errorMessage ?? null],
    );
  }

  private async ensureHistoryTableExists(): Promise<void> {
    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS aurora_schema_version (
        version INTEGER PRIMARY KEY,
        migration_id TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checksum TEXT
      )
    `);

    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS aurora_migration_history (
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
