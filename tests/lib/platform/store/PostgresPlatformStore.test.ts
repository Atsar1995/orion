import { describe, expect, it } from "vitest";
import { createHcmWiring } from "@/lib/hcm/createHcmWiring";
import { HCM_SEED_ORG_ID } from "@/lib/hcm/data/seed-hcm-time";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import {
  InMemoryPlatformStore,
  PostgresPlatformStore,
  StoreProvider,
} from "@/lib/platform/store";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

describe("PostgresPlatformStore", () => {
  it("initializes with mock connection and exposes HCM backing", async () => {
    const connection = new MockDatabaseConnection();
    const migrationRunner = new MigrationRunner(
      connection,
      new MigrationRegistry([bootstrapMigration]),
    );

    const store = new PostgresPlatformStore({
      configuration: {
        provider: StoreProvider.PostgreSQL,
        databaseUrl: "postgresql://mock:5432/orion",
        migrationReady: true,
      },
      connection,
      migrationRunner,
    });

    await store.initialize();

    expect(store.isInitialized()).toBe(true);
    expect(store.provider).toBe(StoreProvider.PostgreSQL);

    const health = await store.checkHealth();
    expect(health.status).toBe("healthy");
    expect(health.details?.serverVersion).toBe("15.0-mock");

    const backing = store.getHcmBacking();
    expect(backing.employees).toBeInstanceOf(Map);
  });

  it("requires database URL during initialization", async () => {
    const store = new PostgresPlatformStore({
      configuration: {
        provider: StoreProvider.PostgreSQL,
        migrationReady: false,
      },
    });

    await expect(store.initialize()).rejects.toThrow(/ORION_DATABASE_URL/i);
  });

  it("wires HCM repositories through platform store backing", async () => {
    const connection = new MockDatabaseConnection();
    const migrationRunner = new MigrationRunner(
      connection,
      new MigrationRegistry([bootstrapMigration]),
    );

    const store = new PostgresPlatformStore({
      configuration: {
        provider: StoreProvider.PostgreSQL,
        databaseUrl: "postgresql://mock:5432/orion",
        migrationReady: true,
      },
      connection,
      migrationRunner,
    });

    await store.initialize();
    const wiring = createHcmWiring(store);

    expect(wiring.platformStore).toBe(store);
    const employee = store.getHcmBacking().employees.get("emp-hcm-001");
    expect(employee?.organizationId).toBe(HCM_SEED_ORG_ID);
  });

  it("remains compatible with in-memory provider switching", () => {
    const memoryStore = new InMemoryPlatformStore();
    const memoryWiring = createHcmWiring(memoryStore);
    expect(memoryWiring.platformStore.provider).toBe(StoreProvider.InMemory);
  });
});
