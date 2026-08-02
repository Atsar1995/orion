import { describe, expect, it } from "vitest";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

describe("MigrationRunner", () => {
  it("runs pending bootstrap migration and tracks version", async () => {
    const connection = new MockDatabaseConnection();
    const runner = new MigrationRunner(connection, new MigrationRegistry([bootstrapMigration]));

    expect(await runner.getCurrentVersion()).toBe(0);

    const records = await runner.runPending();
    expect(records).toHaveLength(1);
    expect(records[0]?.status).toBe("success");
    expect(await runner.getCurrentVersion()).toBe(1);

    const status = await runner.getStatus();
    expect(status.upToDate).toBe(true);
    expect(status.pendingCount).toBe(0);
  });

  it("records execution history for applied migrations", async () => {
    const connection = new MockDatabaseConnection();
    const runner = new MigrationRunner(connection, new MigrationRegistry([bootstrapMigration]));

    await runner.runPending();
    const history = await runner.getExecutionHistory();

    expect(history.some((entry) => entry.direction === "up" && entry.status === "success")).toBe(true);
  });

  it("rolls back the latest migration when enabled", async () => {
    const connection = new MockDatabaseConnection();
    const runner = new MigrationRunner(
      connection,
      new MigrationRegistry([bootstrapMigration]),
      { autoRun: true, allowRollback: true },
    );

    await runner.runPending();
    expect(await runner.getCurrentVersion()).toBe(1);

    const rollbackRecords = await runner.rollback(1);
    expect(rollbackRecords[0]?.direction).toBe("down");
    expect(await runner.getCurrentVersion()).toBe(0);
  });

  it("rejects rollback when disabled by configuration", async () => {
    const connection = new MockDatabaseConnection();
    const runner = new MigrationRunner(
      connection,
      new MigrationRegistry([bootstrapMigration]),
      { autoRun: true, allowRollback: false },
    );

    await runner.runPending();
    await expect(runner.rollback(1)).rejects.toThrow(/rollback is disabled/i);
  });
});
