import { beforeEach, describe, expect, it } from "vitest";
import { createCrmWiring } from "@/lib/crm/createCrmWiring";
import { getCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import {
  CRM_SEED_ORG_ID,
  isOrganizationRegistered,
  registerOrganizationFoundation,
} from "@/lib/crm/persistence/createCrmStore";
import { createCrmRepositories } from "@/lib/crm/persistence/createCrmRepositories";
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

describe("CRM Platform Foundation (P-008.9)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("wires repositories against a shared PlatformStore backing", () => {
    const platformStore = new InMemoryPlatformStore();
    const wiring = createCrmWiring(platformStore);

    expect(wiring.platformStore).toBe(platformStore);
    expect(wiring.backing).toBe(platformStore.getCrmBacking());
    expect(isOrganizationRegistered(wiring.backing, CRM_SEED_ORG_ID)).toBe(true);
    expect(wiring.party.listOrganisations(CRM_SEED_ORG_ID).length).toBeGreaterThan(0);
    expect(wiring.commercial.listLeads(CRM_SEED_ORG_ID).length).toBeGreaterThan(0);
    expect(getCrmEventPipelineRegistry().initialized).toBe(true);
  });

  it("creates repository bundle from isolated backing", () => {
    const backing = createIsolatedCrmBacking();
    const repositories = createCrmRepositories(backing);

    expect(repositories.crm).toBe(repositories.party);
    expect(repositories.commercial).toBe(repositories.agreements);
    expect(isOrganizationRegistered(backing, CRM_SEED_ORG_ID)).toBe(true);
  });

  it("initializes default PlatformStore with CRM backing", async () => {
    const store = await ensureDefaultPlatformStoreInitialized();
    const backing = store.getCrmBacking();

    expect(store.isInitialized()).toBe(true);
    expect(backing.organizationFoundations).toBeInstanceOf(Map);
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

    await platformStore.shutdown();
    expect(platformStore.isInitialized()).toBe(false);
  });
});
