import { beforeEach, describe, expect, it } from "vitest";
import { operationalReadinessService } from "@/lib/platform/operations";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";

describe("RestartRecovery", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("validates platform store initialization for restart survival", async () => {
    const staging = await operationalReadinessService.validateStaging();

    const restartCheck = staging.checks.find((check) => check.name === "restart_survival");
    expect(restartCheck).toBeDefined();
    expect(["healthy", "degraded"]).toContain(restartCheck?.status);
  });

  it("validates migration execution readiness", async () => {
    const staging = await operationalReadinessService.validateStaging();

    const migrationCheck = staging.checks.find((check) => check.name === "migration_execution");
    expect(migrationCheck).toBeDefined();
    expect(migrationCheck?.message).toBeTruthy();
  });

  it("validates connection recovery configuration", async () => {
    const staging = await operationalReadinessService.validateStaging();

    const connectionCheck = staging.checks.find((check) => check.name === "connection_recovery");
    expect(connectionCheck).toBeDefined();
  });

  it("survives store reset and reinitialization", async () => {
    const first = await operationalReadinessService.validateStaging();
    resetDefaultPlatformStoreForTests();
    const second = await operationalReadinessService.validateStaging();

    expect(first.checks.length).toBe(second.checks.length);
    expect(second.checks.some((check) => check.name === "platform_store_health")).toBe(true);
  });
});
