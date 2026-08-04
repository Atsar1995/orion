import { describe, expect, it } from "vitest";
import { InMemoryPlatformStore, PostgresPlatformStore, StoreProvider } from "@/lib/platform/store";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";

const contractCases: Array<{ name: string; create: () => PlatformStore }> = [
  {
    name: "InMemoryPlatformStore",
    create: () => new InMemoryPlatformStore(),
  },
  {
    name: "PostgresPlatformStore",
    create: () => {
      const connection = new MockDatabaseConnection();
      const migrationRunner = new MigrationRunner(
        connection,
        new MigrationRegistry([bootstrapMigration]),
      );
      return new PostgresPlatformStore({
        configuration: {
          provider: StoreProvider.PostgreSQL,
          databaseUrl: "postgresql://mock:5432/orion",
          migrationReady: true,
        },
        connection,
        migrationRunner,
      });
    },
  },
];

describe("PlatformStoreContract", () => {
  for (const testCase of contractCases) {
    describe(testCase.name, () => {
      it("initializes and reports health", async () => {
        const store = testCase.create();
        await store.initialize();

        expect(store.isInitialized()).toBe(true);
        const health = await store.checkHealth();
        expect(["healthy", "degraded"]).toContain(health.status);
        expect(health.provider).toBeDefined();
      });

      it("exposes transaction manager after initialization", async () => {
        const store = testCase.create();
        await store.initialize();

        const manager = store.getTransactionManager();
        const tx = await manager.beginTransaction();
        expect(tx.success).toBe(true);

        if (tx.success) {
          const commit = await manager.commit(tx.data);
          expect(commit.success).toBe(true);
        }
      });

      it("exposes HCM backing after initialization", async () => {
        const store = testCase.create();
        await store.initialize();

        const backing = store.getHcmBacking();
        expect(backing.employees).toBeInstanceOf(Map);
        expect(backing.orgUnits).toBeInstanceOf(Map);
      });

      it("exposes Finance backing after initialization", async () => {
        const store = testCase.create();
        await store.initialize();

        const backing = store.getFinanceBacking();
        expect(backing.accounts).toBeInstanceOf(Map);
        expect(backing.fiscalPeriods).toBeInstanceOf(Map);
        expect(backing.idempotencyKeys).toBeInstanceOf(Map);
      });

      it("exposes CRM backing after initialization", async () => {
        const store = testCase.create();
        await store.initialize();

        const backing = store.getCrmBacking();
        expect(backing.organizationFoundations).toBeInstanceOf(Map);
        expect(backing.idempotencyKeys).toBeInstanceOf(Map);
        expect(backing.entityRegistry).toBeInstanceOf(Map);
      });

      it("shuts down gracefully", async () => {
        const store = testCase.create();
        await store.initialize();
        await store.shutdown();

        expect(store.isInitialized()).toBe(false);
      });
    });
  }
});
