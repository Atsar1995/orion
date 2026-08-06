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
  verifyPostgresColdBoot,
  verifyPostgresHydration,
  verifyPostgresMultipleRestartCycles,
  verifyPostgresOrganizationIsolation,
  verifyPostgresTransactionRecovery,
  verifyPostgresWarmRestart,
  verifyPlatformShutdown,
  verifyPlatformStartup,
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

describe("PostgresOperationalCertification (P-011.2)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceEventPipelineServiceForTests();
    resetCrmEventPipelineRegistryForTests();
    resetProcurementEventPipelineRegistryForTests();
  });

  it("certifies PostgreSQL cold boot initialization", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const result = await verifyPostgresColdBoot(store);

    expect(result.name).toBe("cold_boot");
    expect(result.status).toBe("healthy");
    expect(store.isInitialized()).toBe(true);
    expect(store.provider).toBe(StoreProvider.PostgreSQL);
    await store.shutdown();
  });

  it("certifies graceful platform shutdown", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const result = await verifyPlatformShutdown(store);

    expect(result.name).toBe("platform_shutdown");
    expect(result.status).toBe("healthy");
    expect(store.getLifecycleState()).toBe("shutdown");
  });

  it("certifies warm restart with repository hydration survival", async () => {
    const context = createCertificationContext();
    const result = await verifyPostgresWarmRestart(context);

    expect(result.name).toBe("warm_restart");
    expect(result.status).toBe("healthy");
    expect(result.checks.some((check) => check.name === "repository_survival")).toBe(true);
  });

  it("certifies multiple restart cycles without corruption", async () => {
    const context = createCertificationContext();
    const result = await verifyPostgresMultipleRestartCycles(context, 3);

    expect(result.name).toBe("multiple_restart_cycles");
    expect(result.status).toBe("healthy");
    expect(result.checks.filter((check) => check.name.endsWith("_health"))).toHaveLength(3);
  });

  it("certifies PlatformStore and repository hydration", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const result = await verifyPostgresHydration(store);

    expect(result.status).toBe("healthy");
    expect(result.checks.some((check) => check.name === "finance_backing_hydrated")).toBe(true);
    expect(result.checks.some((check) => check.name === "procurement_backing_hydrated")).toBe(true);
    await store.shutdown();
  });

  it("certifies transaction recovery via rollback", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const result = await verifyPostgresTransactionRecovery(store);

    expect(result.name).toBe("transaction_recovery");
    expect(result.status).toBe("healthy");
    expect(result.checks.some((check) => check.name === "transaction_rollback")).toBe(true);
    await store.shutdown();
  });

  it("certifies organization isolation on hydrated repositories", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);
    await store.initialize();
    const finance = ensureFinancePlatformBacking(store);

    expect(finance.accounts.size).toBeGreaterThan(0);
    expect([...finance.accounts.values()][0]?.organizationId).toBe(FINANCE_SEED_ORG_ID);

    const result = await verifyPostgresOrganizationIsolation(store);

    expect(result.status).toBe("healthy");
    await store.shutdown();
  });

  it("certifies platform startup sequence on PostgreSQL store", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const result = await verifyPlatformStartup(store);

    expect(result.status).toBe("healthy");
    expect(result.checks.some((check) => check.name === "startup_health_probe")).toBe(true);
    await store.shutdown();
  });

  it("generates full PostgreSQL certification report with verdict and evidence", async () => {
    const context = createCertificationContext();
    const report = await enterpriseReadinessService.generatePostgresCertificationReport(context);

    expect(["pass", "conditional", "fail"]).toContain(report.verdict);
    expect(report.scenarios.length).toBeGreaterThanOrEqual(10);
    expect(report.evidence.length).toBeGreaterThan(0);
    expect(report.readinessReport.sections.platformStore.name).toBe("PlatformStore");
    expect(report.scenarios.some((scenario) => scenario.name === "cold_boot")).toBe(true);
    expect(report.scenarios.some((scenario) => scenario.name === "warm_restart")).toBe(true);
    expect(report.scenarios.some((scenario) => scenario.name === "readiness_report")).toBe(true);
  });

  it("restores composition roots and canonical publishers after hydration", async () => {
    const context = createCertificationContext();
    const report = await enterpriseReadinessService.generatePostgresCertificationReport(context);

    expect(getFinanceEventPipelineService()).toBeDefined();
    expect(getCrmEventPipelineRegistry().canonicalPublisherReady).toBe(true);
    expect(getProcurementEventPipelineRegistry().canonicalPublisherReady).toBe(true);

    const compositionScenario = report.scenarios.find(
      (scenario) => scenario.name === "composition_root_restoration",
    );
    expect(compositionScenario?.status).toBe("healthy");
  });

  it("recovers from failure when shutdown follows successful startup", async () => {
    const context = createCertificationContext();
    const store = createPostgresCertificationStore(context);

    const startup = await verifyPlatformStartup(store);
    expect(startup.status).toBe("healthy");

    const shutdown = await verifyPlatformShutdown(store);
    expect(shutdown.status).toBe("healthy");

    const recovery = await verifyPostgresWarmRestart(context);
    expect(recovery.status).toBe("healthy");
  });
});
