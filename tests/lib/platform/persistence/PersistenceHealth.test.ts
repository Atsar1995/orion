import { describe, expect, it } from "vitest";
import { createDatabaseHealthReport } from "@/lib/platform/persistence/DatabaseHealth";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { StoreProvider } from "@/lib/platform/store";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

describe("PersistenceHealth", () => {
  it("reports healthy when connected and migrations are current", async () => {
    const connection = new MockDatabaseConnection();
    const runner = new MigrationRunner(connection, new MigrationRegistry([bootstrapMigration]));
    await runner.runPending();

    const report = await createDatabaseHealthReport({
      provider: StoreProvider.PostgreSQL,
      connection,
      migrationStatus: await runner.getStatus(),
    });

    expect(report.status).toBe("healthy");
    expect(report.connected).toBe(true);
    expect(report.serverVersion).toBe("15.0-mock");
    expect(report.migration.upToDate).toBe(true);
  });

  it("reports degraded when migrations are pending", async () => {
    const connection = new MockDatabaseConnection();
    const runner = new MigrationRunner(connection, new MigrationRegistry([bootstrapMigration]));

    const report = await createDatabaseHealthReport({
      provider: StoreProvider.PostgreSQL,
      connection,
      migrationStatus: await runner.getStatus(),
    });

    expect(report.status).toBe("degraded");
    expect(report.migration.pendingCount).toBeGreaterThan(0);
  });

  it("reports unhealthy when connection probe fails", async () => {
    const connection = new MockDatabaseConnection();
    connection.setConnected(false);

    const report = await createDatabaseHealthReport({
      provider: StoreProvider.PostgreSQL,
      connection,
      migrationStatus: {
        currentVersion: 0,
        latestVersion: 1,
        pendingCount: 1,
        upToDate: false,
      },
    });

    expect(report.status).toBe("unhealthy");
    expect(report.connected).toBe(false);
  });
});
