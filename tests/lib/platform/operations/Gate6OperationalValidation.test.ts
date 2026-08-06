import { beforeEach, describe, expect, it } from "vitest";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { ensureFinancePlatformBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { getCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import { getFinanceEventPipelineService } from "@/lib/finance/services/financeEventPipelineRegistry";
import { enterpriseReadinessService } from "@/lib/platform/operations";
import { getProcurementEventPipelineRegistry } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import {
  createPostgresCertificationStore,
  resetDefaultPlatformStoreForTests,
  verifyPlatformShutdown,
  verifyPlatformStartup,
  verifyPostgresWarmRestart,
} from "@/lib/platform/store/PlatformStoreFactory";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { resetCrmEventPipelineRegistryForTests } from "@/lib/crm/services/crmEventPipelineRegistry";
import { resetFinanceEventPipelineServiceForTests } from "@/lib/finance/services/financeEventPipelineRegistry";
import { resetProcurementEventPipelineRegistryForTests } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

function createCertificationContext() {
  const connection = new MockDatabaseConnection();
  const migrationRunner = new MigrationRunner(
    connection,
    new MigrationRegistry([bootstrapMigration]),
  );

  return {
    connection,
    migrationRunner,
    configuration: {
      provider: StoreProvider.PostgreSQL,
      databaseUrl: "postgresql://mock:5432/orion",
      migrationReady: true,
    },
  } as const;
}

describe("Gate6OperationalValidation (P-011.3)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceEventPipelineServiceForTests();
    resetCrmEventPipelineRegistryForTests();
    resetProcurementEventPipelineRegistryForTests();
  });

  it("validates enterprise startup through verifyPlatform and startup scenario", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const platform = enterpriseReadinessService.verifyPlatform();
    const startup = await verifyPlatformStartup(store);

    expect(platform.status).not.toBe("not_ready");
    expect(startup.name).toBe("platform_startup");
    expect(startup.status).toBe("healthy");
    expect(store.isInitialized()).toBe(true);
    await store.shutdown();
  });

  it("validates enterprise shutdown through verifyPlatformShutdown", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const shutdown = await verifyPlatformShutdown(store);

    expect(shutdown.name).toBe("platform_shutdown");
    expect(shutdown.status).toBe("healthy");
    expect(store.getLifecycleState()).toBe("shutdown");
  });

  it("validates PostgreSQL warm restart and recovery scenarios", async () => {
    const context = createCertificationContext();
    const recovery = await verifyPostgresWarmRestart(context);

    expect(recovery.name).toBe("warm_restart");
    expect(recovery.status).toBe("healthy");
    expect(recovery.checks.some((check) => check.name === "repository_survival")).toBe(true);
  });

  it("validates health monitoring through verifyHealth", () => {
    const health = enterpriseReadinessService.verifyHealth();

    expect(health.name).toBe("Health");
    expect(health.checks.length).toBeGreaterThanOrEqual(10);
    expect(health.checks.some((check) => check.name === "platform_store")).toBe(true);
    expect(["ready", "partial", "not_ready"]).toContain(health.status);
  });

  it("validates persistence and PlatformStore recovery dimensions", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);
    await store.initialize();

    const persistence = await enterpriseReadinessService.verifyPersistence(store);
    const platformStore = enterpriseReadinessService.verifyPlatformStore(store);

    expect(persistence.name).toBe("Persistence");
    expect(platformStore.name).toBe("PlatformStore");
    expect(["ready", "partial", "not_ready"]).toContain(persistence.status);
    expect(["ready", "partial", "not_ready"]).toContain(platformStore.status);
    await store.shutdown();
  });

  it("validates composition roots after wiring registries", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);
    await store.initialize();

    const composition = enterpriseReadinessService.verifyCompositionRoots(store);

    expect(composition.name).toBe("Composition Roots");
    expect(composition.checks.every((check) => check.status === "healthy")).toBe(true);
    expect(composition.status).toBe("ready");
    await store.shutdown();
  });

  it("validates domain hydration across Finance CRM and Procurement backings", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);
    await store.initialize();
    const finance = ensureFinancePlatformBacking(store);

    const domains = enterpriseReadinessService.verifyDomains(store);

    expect(finance.accounts.size).toBeGreaterThan(0);
    expect([...finance.accounts.values()][0]?.organizationId).toBe(FINANCE_SEED_ORG_ID);
    expect(domains.name).toBe("Domains");
    expect(domains.checks.some((check) => check.name === "finance_domain")).toBe(true);
    expect(domains.checks.some((check) => check.name === "crm_domain")).toBe(true);
    expect(domains.checks.some((check) => check.name === "procurement_domain")).toBe(true);
    await store.shutdown();
  });

  it("validates canonical event infrastructure after certification wiring", async () => {
    const context = createCertificationContext();
    await enterpriseReadinessService.generatePostgresCertificationReport(context);

    const events = enterpriseReadinessService.verifyEventInfrastructure();

    expect(events.name).toBe("Canonical Events");
    expect(getFinanceEventPipelineService()).toBeDefined();
    expect(getCrmEventPipelineRegistry().canonicalPublisherReady).toBe(true);
    expect(getProcurementEventPipelineRegistry().canonicalPublisherReady).toBe(true);
  });

  it("validates security and operations readiness sections", async () => {
    const security = enterpriseReadinessService.verifySecurity();
    const operations = await enterpriseReadinessService.verifyOperations();

    expect(security.name).toBe("Security");
    expect(operations.name).toBe("Operations");
    expect(operations.checks.some((check) => check.name === "runbook_registry")).toBe(true);
    expect(["ready", "partial", "not_ready"]).toContain(security.status);
  });

  it("generates full Gate 6 operational validation report with evidence package", async () => {
    const context = createCertificationContext();
    const report = await enterpriseReadinessService.executeGate6Validation(context);

    expect(report.mission).toBe("P-011.3");
    expect(["pass", "conditional_pass", "fail"]).toContain(report.verdict);
    expect(report.evidence.length).toBeGreaterThanOrEqual(14);

    const dimensions = report.evidence.map((item) => item.dimension);
    expect(dimensions).toContain("platform");
    expect(dimensions).toContain("persistence");
    expect(dimensions).toContain("health");
    expect(dimensions).toContain("security");
    expect(dimensions).toContain("rbac");
    expect(dimensions).toContain("rest");
    expect(dimensions).toContain("canonicalEvents");
    expect(dimensions).toContain("platformStore");
    expect(dimensions).toContain("compositionRoots");
    expect(dimensions).toContain("domains");
    expect(dimensions).toContain("monitoring");
    expect(dimensions).toContain("operations");
    expect(dimensions).toContain("postgresql");
    expect(dimensions).toContain("recovery");
    expect(dimensions).toContain("overall");

    expect(report.readinessReport.sections.platform.name).toBe("Platform");
    expect(report.postgresCertification.scenarios.length).toBeGreaterThanOrEqual(10);
    expect(report.blockers.some((blocker) => blocker.id === "OPS-001")).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(["ready", "partial", "not_ready"]).toContain(report.gate7Readiness);
    expect(report.signoff.authorizationStatement.length).toBeGreaterThan(0);
  });

  it("returns conditional_pass in CI mock environment with OPS-001 blocker tracked", async () => {
    const context = createCertificationContext();
    const report = await enterpriseReadinessService.generateGate6ValidationReport(context);

    expect(report.verdict).toBe("conditional_pass");
    expect(report.blockers.some((blocker) => blocker.id === "OPS-001" && blocker.severity === "P0")).toBe(
      true,
    );
    expect(report.generalAvailabilityImpact).toContain("NO-GO");
    expect(report.signoff.platformOps).toBe("conditional_pass");
  });

  it("executes all verification dimensions through nested readiness and postgres reports", async () => {
    const context = createCertificationContext();
    const report = await enterpriseReadinessService.generateGate6ValidationReport(context);

    const { readinessReport, postgresCertification } = report;

    expect(readinessReport.startupVerification.name).toBe("platform_startup");
    expect(readinessReport.shutdownVerification.name).toBe("platform_shutdown");
    expect(readinessReport.sections.security.name).toBe("Security");
    expect(readinessReport.sections.rbac.name).toBe("RBAC");
    expect(readinessReport.sections.rest.name).toBe("REST");
    expect(postgresCertification.scenarios.some((scenario) => scenario.name === "cold_boot")).toBe(
      true,
    );
    expect(
      postgresCertification.scenarios.some((scenario) => scenario.name === "transaction_recovery"),
    ).toBe(true);
    expect(
      postgresCertification.scenarios.some(
        (scenario) => scenario.name === "composition_root_restoration",
      ),
    ).toBe(true);
  });
});
