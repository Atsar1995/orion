/**
 * Database health reporting (Mission P-015.5 · ADR-007 · ADR-011).
 */

import type { DatabaseConnection, DatabasePoolStats } from "@/lib/platform/persistence/DatabaseConnection";
import type { MigrationRunnerStatus } from "@/lib/platform/persistence/MigrationRunner";
import type { StoreProvider } from "@/lib/platform/store/StoreConfiguration";

export type DatabaseHealthStatus = "healthy" | "degraded" | "unhealthy";

export type DatabaseHealthReport = {
  readonly provider: StoreProvider;
  readonly status: DatabaseHealthStatus;
  readonly connected: boolean;
  readonly message: string;
  readonly serverVersion: string | null;
  readonly pool: DatabasePoolStats;
  readonly migration: MigrationRunnerStatus;
  readonly checkedAt: string;
};

export async function createDatabaseHealthReport(input: {
  provider: StoreProvider;
  connection: DatabaseConnection;
  migrationStatus: MigrationRunnerStatus;
  message?: string;
}): Promise<DatabaseHealthReport> {
  const connected = await input.connection.ping();
  const serverVersion = connected ? await input.connection.getServerVersion() : null;
  const pool = input.connection.getPoolStats();

  let status: DatabaseHealthStatus = "healthy";
  let message = input.message ?? "Database connection operational.";

  if (!connected) {
    status = "unhealthy";
    message = "Database connection failed health probe.";
  } else if (!input.migrationStatus.upToDate) {
    status = "degraded";
    message = `Database connected but ${input.migrationStatus.pendingCount} migration(s) pending.`;
  }

  return {
    provider: input.provider,
    status,
    connected,
    message,
    serverVersion,
    pool,
    migration: input.migrationStatus,
    checkedAt: new Date().toISOString(),
  };
}

export function summarizeDatabaseHealth(report: DatabaseHealthReport): Record<string, string> {
  return {
    provider: report.provider,
    status: report.status,
    connected: String(report.connected),
    serverVersion: report.serverVersion ?? "unknown",
    migrationVersion: String(report.migration.currentVersion),
    migrationPending: String(report.migration.pendingCount),
    poolTotal: String(report.pool.totalCount),
    poolIdle: String(report.pool.idleCount),
    checkedAt: report.checkedAt,
  };
}
