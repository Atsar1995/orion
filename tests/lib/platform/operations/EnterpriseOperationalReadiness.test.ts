import { beforeEach, describe, expect, it } from "vitest";
import { healthStatusService } from "@/lib/observability/HealthStatusService";
import {
  enterpriseReadinessService,
  runbookRegistry,
} from "@/lib/platform/operations";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import {
  resetDefaultPlatformStoreForTests,
  verifyPlatformShutdown,
  verifyPlatformStartup,
} from "@/lib/platform/store/PlatformStoreFactory";
import { resetCrmEventPipelineRegistryForTests } from "@/lib/crm/services/crmEventPipelineRegistry";
import { resetFinanceEventPipelineServiceForTests } from "@/lib/finance/services/financeEventPipelineRegistry";
import { resetProcurementEventPipelineRegistryForTests } from "@/lib/procurement/services/procurementEventPipelineRegistry";

describe("EnterpriseOperationalReadiness (P-011.1)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceEventPipelineServiceForTests();
    resetCrmEventPipelineRegistryForTests();
    resetProcurementEventPipelineRegistryForTests();
  });

  it("verifies platform startup through initialize and health probe", async () => {
    const store = new InMemoryPlatformStore();
    const result = await verifyPlatformStartup(store);

    expect(result.name).toBe("platform_startup");
    expect(result.checks.some((check) => check.name === "initialize_complete")).toBe(true);
    expect(result.checks.some((check) => check.name === "startup_health_probe")).toBe(true);
    expect(["healthy", "degraded"]).toContain(result.status);
    expect(store.isInitialized()).toBe(true);
  });

  it("verifies platform shutdown through graceful lifecycle transition", async () => {
    const store = new InMemoryPlatformStore();
    const result = await verifyPlatformShutdown(store);

    expect(result.name).toBe("platform_shutdown");
    expect(result.checks.some((check) => check.name === "shutdown_complete")).toBe(true);
    expect(result.checks.some((check) => check.name === "lifecycle_shutdown")).toBe(true);
    expect(store.getLifecycleState()).toBe("shutdown");
  });

  it("verifies health through HealthStatusService", () => {
    const verification = healthStatusService.verifyHealth();

    expect(verification.checks.length).toBeGreaterThanOrEqual(10);
    expect(verification.checks.some((check) => check.name === "platform_store")).toBe(true);
    expect(verification.checks.some((check) => check.name === "hcm_platform")).toBe(true);
    expect(verification.checks.some((check) => check.name === "finance_platform")).toBe(true);
    expect(verification.checks.some((check) => check.name === "crm_platform")).toBe(true);
    expect(verification.checks.some((check) => check.name === "procurement_platform")).toBe(true);
    expect(["healthy", "degraded", "unhealthy"]).toContain(verification.status);
  });

  it("detects missing event pipeline dependencies as degraded", () => {
    const section = enterpriseReadinessService.verifyEventInfrastructure();

    expect(section.checks.some((check) => check.name === "finance_event_pipeline")).toBe(true);
    expect(section.status).toBe("partial");
    expect(section.checks.some((check) => check.status === "degraded")).toBe(true);
  });

  it("generates structured enterprise readiness report with all sections", async () => {
    const store = new InMemoryPlatformStore();
    const report = await enterpriseReadinessService.generateReadinessReport(store);

    expect(report.sections.platform.name).toBe("Platform");
    expect(report.sections.persistence.name).toBe("Persistence");
    expect(report.sections.health.name).toBe("Health");
    expect(report.sections.security.name).toBe("Security");
    expect(report.sections.rbac.name).toBe("RBAC");
    expect(report.sections.rest.name).toBe("REST");
    expect(report.sections.canonicalEvents.name).toBe("Canonical Events");
    expect(report.sections.platformStore.name).toBe("PlatformStore");
    expect(report.sections.compositionRoots.name).toBe("Composition Roots");
    expect(report.sections.postgresql.name).toBe("PostgreSQL");
    expect(report.sections.monitoring.name).toBe("Monitoring");
    expect(report.sections.operations.name).toBe("Operations");
    expect(["ready", "partial", "not_ready"]).toContain(report.overallReadiness);
    expect(report.startupVerification.name).toBe("platform_startup");
    expect(report.shutdownVerification.name).toBe("platform_shutdown");
  });

  it("survives store restart verification after shutdown", async () => {
    const store = new InMemoryPlatformStore();
    await verifyPlatformStartup(store);
    await verifyPlatformShutdown(store);

    const restarted = new InMemoryPlatformStore();
    const restartResult = await verifyPlatformStartup(restarted);

    expect(restartResult.status).not.toBe("unhealthy");
    expect(restarted.getLifecycleState()).toBe("initialized");
  });

  it("registers enterprise runbook documentation paths", () => {
    const enterpriseRunbooks = [
      "platform-startup",
      "platform-shutdown",
      "database-recovery",
      "release-deployment",
      "health-verification",
    ];

    for (const id of enterpriseRunbooks) {
      expect(runbookRegistry.getRunbook(id)).toBeDefined();
    }
  });

  it("resolves composition roots when wiring registries are initialized", async () => {
    const store = new InMemoryPlatformStore();
    await enterpriseReadinessService.generateReadinessReport(store);

    const composition = enterpriseReadinessService.verifyCompositionRoots(store);
    expect(composition.checks.every((check) => check.status === "healthy")).toBe(true);
    expect(composition.status).toBe("ready");
  });
});
