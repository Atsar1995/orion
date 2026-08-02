import { describe, expect, it } from "vitest";
import { createFoundationRepositories } from "@/lib/hcm/data/createFoundationRepositories";
import { createHcmWiring } from "@/lib/hcm/createHcmWiring";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { HCM_SEED_ORG_ID, seedHcmTimeData } from "@/lib/hcm/data/seed-hcm-time";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import {
  InMemoryPlatformStore,
  PostgresPlatformStore,
  StoreProvider,
} from "@/lib/platform/store";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

describe("Repository compatibility with PlatformStore providers", () => {
  it("foundation repositories operate against in-memory backing", () => {
    const store = new InMemoryHcmStore();
    seedHcmTimeData(store);
    const repositories = createFoundationRepositories(store);

    const employee = repositories.employee.findById(HCM_SEED_ORG_ID, "emp-hcm-001");
    expect(employee).not.toBeNull();
  });

  it("foundation repositories operate against postgres-backed store", async () => {
    const connection = new MockDatabaseConnection();
    const migrationRunner = new MigrationRunner(
      connection,
      new MigrationRegistry([bootstrapMigration]),
    );
    const platformStore = new PostgresPlatformStore({
      configuration: {
        provider: StoreProvider.PostgreSQL,
        databaseUrl: "postgresql://mock:5432/orion",
        migrationReady: true,
      },
      connection,
      migrationRunner,
    });

    await platformStore.initialize();
    const wiring = createHcmWiring(platformStore);
    const employee = wiring.platformStore.getHcmBacking().employees.get("emp-hcm-001");

    expect(employee?.organizationId).toBe(HCM_SEED_ORG_ID);
  });

  it("preserves in-memory default wiring path", () => {
    const wiring = createHcmWiring(new InMemoryPlatformStore());
    expect(wiring.platformStore.provider).toBe(StoreProvider.InMemory);
    expect(wiring.foundation).toBeDefined();
  });
});
