import { beforeEach, describe, expect, it } from "vitest";
import {
  backupService,
  deploymentHealth,
  disasterRecoveryService,
  operationalReadinessService,
  runbookRegistry,
} from "@/lib/platform/operations";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";

describe("OperationalReadiness", () => {
  beforeEach(() => {
    backupService.resetForTests();
    resetDefaultPlatformStoreForTests();
  });

  it("assesses operational readiness with scoring dimensions", async () => {
    backupService.createBackup({
      provider: "postgresql",
      tables: ["hcm_employees", "hcm_departments"],
    });

    const report = await operationalReadinessService.assess();

    expect(report.scores.operationsHealth).toBeGreaterThan(0);
    expect(report.scores.reliabilityScore).toBeGreaterThan(0);
    expect(report.scores.availabilityScore).toBeGreaterThan(0);
    expect(report.scores.deploymentReadiness).toBeGreaterThan(0);
    expect(report.scores.productionReadinessScore).toBeGreaterThan(74);
    expect(report.runbookCount).toBeGreaterThanOrEqual(8);
    expect(["healthy", "degraded", "unhealthy"]).toContain(report.status);
  });

  it("registers all required operational runbooks", () => {
    const required = [
      "platform-startup",
      "platform-shutdown",
      "incident-response",
      "database-recovery",
      "migration-execution",
      "release-deployment",
      "emergency-rollback",
      "health-verification",
    ];

    for (const id of required) {
      expect(runbookRegistry.getRunbook(id)).toBeDefined();
    }
  });

  it("validates staging requirements", async () => {
    const staging = await operationalReadinessService.validateStaging();

    expect(staging.checks.some((check) => check.name === "platform_store_health")).toBe(true);
    expect(staging.checks.some((check) => check.name === "rbac_fail_closed")).toBe(true);
    expect(staging.checks.some((check) => check.name === "health_endpoints")).toBe(true);
    expect(staging.checks.some((check) => check.name === "restart_survival")).toBe(true);
  });

  it("reports deployment health with CI assessment", () => {
    const report = deploymentHealth.assess();

    expect(report.checks.some((check) => check.name === "quality_gate_workflow")).toBe(true);
    expect(report.readinessScore).toBeGreaterThan(0);
  });

  it("validates disaster recovery readiness with runbooks", () => {
    backupService.createBackup({ provider: "postgresql", tables: ["platform_migrations"] });

    const readiness = disasterRecoveryService.validateRecoveryReadiness();

    expect(readiness.checks.some((check) => check.name === "backup_available")).toBe(true);
    expect(readiness.checks.some((check) => check.name.startsWith("runbook_"))).toBe(true);
    expect(readiness.checks.some((check) => check.name === "rpo_rto_defined")).toBe(true);
  });
});
