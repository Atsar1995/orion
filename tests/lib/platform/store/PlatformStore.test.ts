import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { createHcmWiring } from "@/lib/hcm/createHcmWiring";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import {
  InMemoryPlatformStore,
  PlatformStoreFactory,
  PostgresPlatformStore,
  StoreProvider,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/store";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

describe("PlatformStore", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("creates in-memory store as healthy and initialized", async () => {
    const store = PlatformStoreFactory.create({ provider: StoreProvider.InMemory, migrationReady: true });

    expect(store.isInitialized()).toBe(true);
    expect(store.provider).toBe(StoreProvider.InMemory);

    const health = await store.checkHealth();
    expect(health.status).toBe("healthy");
    expect(health.migrationReady).toBe(true);
  });

  it("exposes HCM backing for repository wiring", () => {
    const hcmStore = new InMemoryHcmStore();
    const platformStore = new InMemoryPlatformStore({ hcmStore });
    const wiring = createHcmWiring(platformStore);

    expect(wiring.platformStore).toBe(platformStore);
    expect(platformStore.getHcmBacking()).toBe(hcmStore);
  });

  it("returns migration readiness for in-memory provider", () => {
    const store = new InMemoryPlatformStore();
    const readiness = store.getMigrationReadiness();

    expect(readiness.ready).toBe(true);
    expect(readiness.provider).toBe(StoreProvider.InMemory);
  });

  it("implements postgres store with mock connection", async () => {
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

    expect(store.isInitialized()).toBe(false);
    await store.initialize();
    expect(store.isInitialized()).toBe(true);

    const health = await store.checkHealth();
    expect(health.status).toBe("healthy");
    expect(health.migrationReady).toBe(true);
  });

  it("provides transaction manager on in-memory store", async () => {
    const store = new InMemoryPlatformStore();
    const manager = store.getTransactionManager();
    const tx = await manager.beginTransaction();

    expect(tx.success).toBe(true);
    if (tx.success) {
      expect(tx.data.transactionId).toMatch(/^noop-/);
    }
  });
});
