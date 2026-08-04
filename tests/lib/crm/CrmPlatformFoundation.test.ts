import { beforeEach, describe, expect, it } from "vitest";
import { createCrmWiring } from "@/lib/crm/createCrmWiring";
import { getCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import {
  CRM_SEED_ORG_ID,
  isOrganizationRegistered,
  registerOrganizationFoundation,
} from "@/lib/crm/persistence/createCrmStore";
import { createCrmRepositories } from "@/lib/crm/persistence/createCrmRepositories";
import { createCrmPersistenceRepositories } from "@/lib/crm/persistence/createCrmPersistenceRepositories";
import { createIsolatedCrmBacking } from "@/lib/crm/persistence/CrmPlatformBacking";
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

describe("CRM Platform Foundation (P-008.9 · P-008.10)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("wires repositories against a shared PlatformStore backing", () => {
    const platformStore = new InMemoryPlatformStore();
    const wiring = createCrmWiring(platformStore);

    expect(wiring.platformStore).toBe(platformStore);
    expect(wiring.backing).toBe(platformStore.getCrmBacking());
    expect(wiring.crmRepository.domain).toBe("crm");
    expect(wiring.crmRepository.persistenceAdapter).toBe("in-memory");
    expect(isOrganizationRegistered(wiring.backing, CRM_SEED_ORG_ID)).toBe(true);
    expect(wiring.party.listOrganisations(CRM_SEED_ORG_ID).length).toBeGreaterThan(0);
    expect(wiring.commercial.listLeads(CRM_SEED_ORG_ID).length).toBeGreaterThan(0);
    expect(getCrmEventPipelineRegistry().initialized).toBe(true);
    expect(getCrmEventPipelineRegistry().canonicalPublisherReady).toBe(true);
    expect(wiring.canonicalEventPublisher).toBeDefined();
    expect(wiring.salesOrderService).toBeDefined();
    expect(wiring.caseService).toBeDefined();
  });

  it("creates repository bundle from isolated backing", () => {
    const backing = createIsolatedCrmBacking();
    const repositories = createCrmRepositories(backing);

    expect(repositories.crm).toBe(repositories.party);
    expect(repositories.commercial).toBe(repositories.agreements);
    expect(isOrganizationRegistered(backing, CRM_SEED_ORG_ID)).toBe(true);
  });

  it("creates persistence repository factory with shared backing collections", () => {
    const platformStore = new InMemoryPlatformStore();
    const { crmRepository } = createCrmPersistenceRepositories({ platformStore });
    const backing = platformStore.getCrmBacking();

    expect(backing.accounts).toBeInstanceOf(Map);
    expect(backing.contacts).toBeInstanceOf(Map);
    expect(backing.organizations).toBeInstanceOf(Map);
    expect(backing.leads).toBeInstanceOf(Map);
    expect(backing.opportunities).toBeInstanceOf(Map);
    expect(backing.quotes).toBeInstanceOf(Map);
    expect(backing.activities).toBeInstanceOf(Map);
    expect(backing.cases).toBeInstanceOf(Map);
    expect(backing.salesOrders).toBeInstanceOf(Map);
    expect(backing.notes).toBeInstanceOf(Map);
    expect(backing.attachments).toBeInstanceOf(Map);
    expect(backing.entityRegistry).toBeInstanceOf(Map);
    expect(backing.idempotencyKeys).toBeInstanceOf(Map);

    const record = crmRepository.upsert("leads", {
      id: "lead-001",
      organizationId: CRM_SEED_ORG_ID,
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(record.id).toBe("lead-001");
    expect(crmRepository.getById(CRM_SEED_ORG_ID, "leads", "lead-001")).toEqual(record);
    expect(crmRepository.listByOrganization("org-other", "leads")).toHaveLength(0);
  });

  it("reuses shared backing between composition root and persistence repository", () => {
    const platformStore = new InMemoryPlatformStore();
    const wiring = createCrmWiring(platformStore);

    wiring.crmRepository.upsert("accounts", {
      id: "acct-001",
      organizationId: CRM_SEED_ORG_ID,
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(wiring.backing.accounts.get("acct-001")).toBeDefined();
    expect(platformStore.getCrmBacking().accounts.get("acct-001")).toBeDefined();
  });

  it("initializes default PlatformStore with CRM backing", async () => {
    const store = await ensureDefaultPlatformStoreInitialized();
    const backing = store.getCrmBacking();

    expect(store.isInitialized()).toBe(true);
    expect(backing.organizationFoundations).toBeInstanceOf(Map);
    expect(backing.leads).toBeInstanceOf(Map);
    expect(backing.idempotencyKeys).toBeInstanceOf(Map);
    expect(backing.entityRegistry).toBeInstanceOf(Map);
  });

  it("reports CRM platform health via HealthStatusService", () => {
    const report = healthStatusService.getReport();
    const crmCheck = report.checks.find((check) => check.name === "crm_platform");

    expect(crmCheck).toBeDefined();
    expect(crmCheck?.status).toBe("healthy");
  });

  it("enforces organization isolation on foundation markers", () => {
    const backing = createIsolatedCrmBacking(false);

    registerOrganizationFoundation(backing, "org-alpha");
    registerOrganizationFoundation(backing, "org-beta");

    expect(isOrganizationRegistered(backing, "org-alpha")).toBe(true);
    expect(isOrganizationRegistered(backing, "org-beta")).toBe(true);
    expect(isOrganizationRegistered(backing, "org-other")).toBe(false);
    expect(backing.organizationFoundations.size).toBe(2);
  });

  it("enforces organization isolation on persistence aggregates", () => {
    const platformStore = new InMemoryPlatformStore();
    const { crmRepository } = createCrmPersistenceRepositories({ platformStore });

    crmRepository.upsert("opportunities", {
      id: "opp-001",
      organizationId: "org-alpha",
      createdAt: "2026-08-04T00:00:00.000Z",
      updatedAt: "2026-08-04T00:00:00.000Z",
    });

    expect(crmRepository.getById("org-alpha", "opportunities", "opp-001")).not.toBeNull();
    expect(crmRepository.getById("org-beta", "opportunities", "opp-001")).toBeNull();
    expect(crmRepository.listByOrganization("org-beta", "opportunities")).toHaveLength(0);
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

    const { crmRepository } = createCrmPersistenceRepositories({
      platformStore: store,
      connection: store.getDatabaseConnection() ?? undefined,
    });

    expect(crmRepository.persistenceAdapter).toBe("postgresql");
    expect(store.getCrmBacking().accounts).toBeInstanceOf(Map);
  });

  it("initializes PostgreSQL PlatformStore with CRM backing", async () => {
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

    const backing = store.getCrmBacking();
    expect(backing.organizationFoundations).toBeInstanceOf(Map);
    expect(store.getDatabaseConnection?.()).toBe(connection);
  });

  it("supports composition root lifecycle without mutating platform singleton state", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();

    const wiring = createCrmWiring(platformStore);
    expect(isOrganizationRegistered(wiring.backing, CRM_SEED_ORG_ID)).toBe(true);

    registerOrganizationFoundation(wiring.backing, "org-extension");
    expect(getCrmEventPipelineRegistry().backingOrganizationIds()).toContain("org-extension");

    wiring.crmRepository.registerIdempotencyKey(CRM_SEED_ORG_ID, "key-001", "value-001");
    expect(wiring.crmRepository.getIdempotencyKey(CRM_SEED_ORG_ID, "key-001")).toBe("value-001");

    await platformStore.shutdown();
    expect(platformStore.isInitialized()).toBe(false);
  });
});
