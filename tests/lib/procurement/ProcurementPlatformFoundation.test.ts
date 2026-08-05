import { beforeEach, describe, expect, it } from "vitest";
import { createProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import { getProcurementEventPipelineRegistry } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import {
  PROCUREMENT_SEED_ORG_ID,
  isOrganizationRegistered,
  registerOrganizationFoundation,
} from "@/lib/procurement/persistence/createProcurementStore";
import { createProcurementRepositories } from "@/lib/procurement/persistence/createProcurementRepositories";
import { createProcurementPersistenceRepositories } from "@/lib/procurement/persistence/createProcurementPersistenceRepositories";
import { createIsolatedProcurementBacking } from "@/lib/procurement/persistence/ProcurementPlatformBacking";
import { healthStatusService } from "@/lib/observability/HealthStatusService";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import {
  PostgresPlatformStore,
  StoreProvider,
} from "@/lib/platform/store";
import {
  ensureDefaultPlatformStoreInitialized,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/store/PlatformStoreFactory";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

describe("Procurement Platform Foundation (P-010.3 · P-010.4)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("wires repositories against a shared PlatformStore backing", () => {
    const platformStore = new InMemoryPlatformStore();
    const wiring = createProcurementWiring(platformStore);

    expect(wiring.platformStore).toBe(platformStore);
    expect(wiring.backing).toBe(platformStore.getProcurementBacking());
    expect(wiring.procurementRepository.domain).toBe("procurement");
    expect(wiring.procurementRepository.persistenceAdapter).toBe("in-memory");
    expect(isOrganizationRegistered(wiring.backing, PROCUREMENT_SEED_ORG_ID)).toBe(true);
    expect(getProcurementEventPipelineRegistry().initialized).toBe(true);
    expect(getProcurementEventPipelineRegistry().canonicalPublisherReady).toBe(true);
    expect(wiring.procurement).toBe(wiring.procurementRepository);
    expect(wiring.suppliers).toBe(wiring.procurementRepository);
    expect(wiring.authorization).toBeDefined();
    expect(wiring.canonicalEventPublisher).toBeDefined();
    expect(wiring.procurementRepository.infrastructureVersion).toBe("P-010.4");
  });

  it("creates repository bundle from isolated backing", () => {
    const backing = createIsolatedProcurementBacking();
    const repositories = createProcurementRepositories(backing);

    expect(repositories.procurement.domain).toBe("procurement");
    expect(isOrganizationRegistered(backing, PROCUREMENT_SEED_ORG_ID)).toBe(true);
  });

  it("creates persistence repository factory with shared backing collections", () => {
    const platformStore = new InMemoryPlatformStore();
    const { procurementRepository } = createProcurementPersistenceRepositories({ platformStore });
    const backing = platformStore.getProcurementBacking();

    expect(backing.vendors).toBeInstanceOf(Map);
    expect(backing.vendorContacts).toBeInstanceOf(Map);
    expect(backing.catalogs).toBeInstanceOf(Map);
    expect(backing.catalogItems).toBeInstanceOf(Map);
    expect(backing.items).toBeInstanceOf(Map);
    expect(backing.requisitions).toBeInstanceOf(Map);
    expect(backing.purchaseApprovals).toBeInstanceOf(Map);
    expect(backing.rfqs).toBeInstanceOf(Map);
    expect(backing.quotations).toBeInstanceOf(Map);
    expect(backing.purchaseOrders).toBeInstanceOf(Map);
    expect(backing.purchaseContracts).toBeInstanceOf(Map);
    expect(backing.goodsReceipts).toBeInstanceOf(Map);
    expect(backing.receivingLines).toBeInstanceOf(Map);
    expect(backing.supplierInvoices).toBeInstanceOf(Map);
    expect(backing.vendorScorecards).toBeInstanceOf(Map);
    expect(backing.entityRegistry).toBeInstanceOf(Map);
    expect(backing.idempotencyKeys).toBeInstanceOf(Map);

    const record = procurementRepository.upsert("vendors", {
      id: "vendor-001",
      organizationId: PROCUREMENT_SEED_ORG_ID,
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(record.id).toBe("vendor-001");
    expect(procurementRepository.getById(PROCUREMENT_SEED_ORG_ID, "vendors", "vendor-001")).toEqual(
      record,
    );
    expect(procurementRepository.listByOrganization("org-other", "vendors")).toHaveLength(0);
  });

  it("reuses shared backing between composition root and persistence repository", () => {
    const platformStore = new InMemoryPlatformStore();
    const wiring = createProcurementWiring(platformStore);

    wiring.procurementRepository.upsert("requisitions", {
      id: "req-001",
      organizationId: PROCUREMENT_SEED_ORG_ID,
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(wiring.backing.requisitions.get("req-001")).toBeDefined();
    expect(platformStore.getProcurementBacking().requisitions.get("req-001")).toBeDefined();
  });

  it("initializes default PlatformStore with Procurement backing", async () => {
    const store = await ensureDefaultPlatformStoreInitialized();
    const backing = store.getProcurementBacking();

    expect(store.isInitialized()).toBe(true);
    expect(backing.organizationFoundations).toBeInstanceOf(Map);
    expect(backing.vendors).toBeInstanceOf(Map);
    expect(backing.idempotencyKeys).toBeInstanceOf(Map);
    expect(backing.entityRegistry).toBeInstanceOf(Map);
  });

  it("reports Procurement platform health via HealthStatusService", () => {
    const report = healthStatusService.getReport();
    const procurementCheck = report.checks.find((check) => check.name === "procurement_platform");

    expect(procurementCheck).toBeDefined();
    expect(procurementCheck?.status).toBe("healthy");
  });

  it("enforces organization isolation on foundation markers", () => {
    const backing = createIsolatedProcurementBacking(false);

    registerOrganizationFoundation(backing, "org-alpha");
    registerOrganizationFoundation(backing, "org-beta");

    expect(isOrganizationRegistered(backing, "org-alpha")).toBe(true);
    expect(isOrganizationRegistered(backing, "org-beta")).toBe(true);
    expect(isOrganizationRegistered(backing, "org-other")).toBe(false);
    expect(backing.organizationFoundations.size).toBe(2);
  });

  it("enforces organization isolation on persistence aggregates", () => {
    const platformStore = new InMemoryPlatformStore();
    const { procurementRepository } = createProcurementPersistenceRepositories({ platformStore });

    procurementRepository.upsert("purchaseOrders", {
      id: "po-001",
      organizationId: "org-alpha",
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(procurementRepository.getById("org-alpha", "purchaseOrders", "po-001")).not.toBeNull();
    expect(procurementRepository.getById("org-beta", "purchaseOrders", "po-001")).toBeNull();
    expect(procurementRepository.listByOrganization("org-beta", "purchaseOrders")).toHaveLength(0);
  });

  it("selects PostgreSQL persistence adapter when relational PlatformStore is initialized", async () => {
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
    expect(store.getProcurementBacking().vendors).toBeInstanceOf(Map);
  });

  it("initializes PostgreSQL PlatformStore with Procurement backing", async () => {
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

    const backing = store.getProcurementBacking();
    expect(backing.organizationFoundations).toBeInstanceOf(Map);
    expect(store.getDatabaseConnection?.()).toBe(connection);
  });

  it("supports composition root lifecycle without mutating platform singleton state", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();

    const wiring = createProcurementWiring(platformStore);
    expect(isOrganizationRegistered(wiring.backing, PROCUREMENT_SEED_ORG_ID)).toBe(true);

    registerOrganizationFoundation(wiring.backing, "org-extension");
    expect(getProcurementEventPipelineRegistry().backingOrganizationIds()).toContain("org-extension");

    wiring.procurementRepository.registerIdempotencyKey(PROCUREMENT_SEED_ORG_ID, "key-001", "value-001");
    expect(wiring.procurementRepository.getIdempotencyKey(PROCUREMENT_SEED_ORG_ID, "key-001")).toBe(
      "value-001",
    );

    await platformStore.shutdown();
    expect(platformStore.isInitialized()).toBe(false);
  });
});
