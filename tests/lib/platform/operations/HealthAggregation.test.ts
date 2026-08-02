import { beforeEach, describe, expect, it } from "vitest";
import { operationalHealthService } from "@/lib/platform/operations";
import { backupService } from "@/lib/platform/operations/BackupService";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";

describe("HealthAggregation", () => {
  beforeEach(() => {
    backupService.resetForTests();
    resetDefaultPlatformStoreForTests();
  });

  it("aggregates operational health checks", async () => {
    backupService.createBackup({ provider: "postgresql", tables: ["hcm_employees"] });

    const report = await operationalHealthService.getAggregatedReport();

    expect(report.checks.length).toBeGreaterThan(8);
    expect(report.checks.some((check) => check.name === "environment")).toBe(true);
    expect(report.checks.some((check) => check.name === "platform_store_live")).toBe(true);
    expect(report.checks.some((check) => check.name === "rbac_fail_closed")).toBe(true);
    expect(report.checks.some((check) => check.name === "backup_readiness")).toBe(true);
    expect(report.checks.some((check) => check.name === "disaster_recovery")).toBe(true);
    expect(report.checks.some((check) => check.name === "deployment_readiness")).toBe(true);
    expect(report.diagnostics.correlationId).toBeTruthy();
    expect(report.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it("includes base health checks from HealthStatusService", async () => {
    const report = await operationalHealthService.getAggregatedReport();

    expect(report.checks.some((check) => check.name === "platform_store")).toBe(true);
    expect(report.checks.some((check) => check.name === "platform_security")).toBe(true);
  });

  it("derives overall status from worst check", async () => {
    const report = await operationalHealthService.getAggregatedReport();
    const statuses = report.checks.map((check) => check.status);

    if (statuses.includes("unhealthy")) {
      expect(report.status).toBe("unhealthy");
    } else if (statuses.includes("degraded")) {
      expect(report.status).toBe("degraded");
    } else {
      expect(report.status).toBe("healthy");
    }
  });
});
