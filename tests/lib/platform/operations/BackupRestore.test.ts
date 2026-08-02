import { beforeEach, describe, expect, it } from "vitest";
import { backupService } from "@/lib/platform/operations";

describe("BackupRestore", () => {
  beforeEach(() => {
    backupService.resetForTests();
  });

  it("creates and verifies a backup within RPO", () => {
    const backup = backupService.createBackup({
      provider: "postgresql",
      tables: ["hcm_employees", "hcm_positions"],
      sizeBytes: 4096,
    });

    expect(backup.id).toMatch(/^bkp-/);
    expect(backup.tables).toHaveLength(2);
    expect(backup.verified).toBe(true);

    const verification = backupService.verifyBackup(backup.id);
    expect(verification.status).toBe("healthy");
    expect(verification.withinRpo).toBe(true);
  });

  it("validates restore integrity", () => {
    const backup = backupService.createBackup({
      provider: "postgresql",
      tables: ["platform_migrations"],
    });

    const restore = backupService.validateRestore(backup.id);
    expect(restore.integrityValid).toBe(true);
    expect(restore.status).toBe("healthy");
  });

  it("reports degraded when no backups exist", () => {
    const readiness = backupService.assessBackupReadiness();
    expect(readiness.status).toBe("degraded");
    expect(readiness.latestBackupId).toBeNull();
  });

  it("applies retention policy configuration", () => {
    const policy = backupService.configurePolicy({ rpoHours: 12, rtoMinutes: 30, retentionDays: 14 });

    expect(policy.rpoHours).toBe(12);
    expect(policy.rtoMinutes).toBe(30);
    expect(policy.retentionDays).toBe(14);
  });

  it("returns unhealthy verification for unknown backup", () => {
    const result = backupService.verifyBackup("bkp-missing");
    expect(result.status).toBe("unhealthy");
    expect(result.withinRpo).toBe(false);
  });
});
