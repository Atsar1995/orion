import { beforeEach, describe, expect, it } from "vitest";
import {
  PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION,
  PROCUREMENT_SEED_ORG_ID,
} from "@/lib/procurement/persistence/createProcurementStore";
import { createProcurementPersistenceRepositories } from "@/lib/procurement/persistence/createProcurementPersistenceRepositories";
import { createProcurementRepositories } from "@/lib/procurement/persistence/createProcurementRepositories";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import { createIsolatedProcurementBacking } from "@/lib/procurement/persistence/ProcurementPlatformBacking";
import {
  assertProcurementBackingCollections,
  getProcurementBackingCollection,
  isProcurementPersistenceCollection,
  listProcurementPersistenceCollections,
  PROCUREMENT_PERSISTENCE_COLLECTIONS,
} from "@/lib/procurement/persistence/procurementBackingCollections";
import { InMemoryPlatformStore, PostgresPlatformStore, StoreProvider } from "@/lib/platform/store";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

describe("Procurement Repository Infrastructure (P-010.4)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("registers all aggregate and infrastructure backing collections", () => {
    const backing = createIsolatedProcurementBacking();

    expect(PROCUREMENT_PERSISTENCE_COLLECTIONS).toHaveLength(15);
    expect(listProcurementPersistenceCollections()).toEqual(PROCUREMENT_PERSISTENCE_COLLECTIONS);
    expect(() => assertProcurementBackingCollections(backing)).not.toThrow();

    for (const collection of PROCUREMENT_PERSISTENCE_COLLECTIONS) {
      expect(isProcurementPersistenceCollection(collection)).toBe(true);
      expect(getProcurementBackingCollection(backing, collection)).toBeInstanceOf(Map);
    }
  });

  it("constructs bounded-context repository aliases from a shared persistence adapter", () => {
    const backing = createIsolatedProcurementBacking();
    const repositories = createProcurementRepositories(backing);

    expect(repositories.procurement).toBe(repositories.suppliers);
    expect(repositories.sourcing).toBe(repositories.ordering);
    expect(repositories.receiving).toBe(repositories.procurement);
    expect(repositories.procurement.infrastructureVersion).toBe(
      PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION,
    );
  });

  it("uses one shared backing between factory and composition root", () => {
    const platformStore = new InMemoryPlatformStore();
    const { procurementRepository } = createProcurementPersistenceRepositories({ platformStore });
    const wiring = createProcurementWiring(platformStore);

    procurementRepository.upsert("vendors", {
      id: "vendor-shared",
      organizationId: PROCUREMENT_SEED_ORG_ID,
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(wiring.procurementRepository.getById(PROCUREMENT_SEED_ORG_ID, "vendors", "vendor-shared")).not.toBeNull();
    expect(wiring.procurement).toBe(wiring.suppliers);
    expect(wiring.backing).toBe(platformStore.getProcurementBacking());
  });

  it("registers entities on upsert and clears registry on remove", () => {
    const platformStore = new InMemoryPlatformStore();
    const { procurementRepository } = createProcurementPersistenceRepositories({ platformStore });
    const backing = platformStore.getProcurementBacking();

    procurementRepository.upsert("purchaseOrders", {
      id: "po-001",
      organizationId: PROCUREMENT_SEED_ORG_ID,
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(backing.entityRegistry.has("purchaseOrders::po-001")).toBe(true);

    const removed = procurementRepository.remove(
      PROCUREMENT_SEED_ORG_ID,
      "purchaseOrders",
      "po-001",
    );

    expect(removed).toBe(true);
    expect(backing.entityRegistry.has("purchaseOrders::po-001")).toBe(false);
  });

  it("selects PostgreSQL adapter through persistence repository factory", async () => {
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

    const { procurementRepository } = createProcurementPersistenceRepositories({
      platformStore: store,
      connection: store.getDatabaseConnection() ?? undefined,
    });

    expect(procurementRepository.persistenceAdapter).toBe("postgresql");
    expect(procurementRepository.infrastructureVersion).toBe(
      PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION,
    );
  });

  it("enforces organization isolation across every aggregate collection", () => {
    const platformStore = new InMemoryPlatformStore();
    const { procurementRepository } = createProcurementPersistenceRepositories({ platformStore });

    for (const collection of PROCUREMENT_PERSISTENCE_COLLECTIONS) {
      procurementRepository.upsert(collection, {
        id: `${collection}-001`,
        organizationId: "org-alpha",
        createdAt: "2026-08-04T00:00:00.000Z",
        updatedAt: "2026-08-04T00:00:00.000Z",
      });

      expect(
        procurementRepository.getById("org-alpha", collection, `${collection}-001`),
      ).not.toBeNull();
      expect(procurementRepository.getById("org-beta", collection, `${collection}-001`)).toBeNull();
      expect(procurementRepository.listByOrganization("org-beta", collection)).toHaveLength(0);
    }
  });
});
