import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import {
  createAuroraRuntimeContext,
  createTestAuroraRuntimeContext,
} from "@/lib/aurora/identity/AuroraContextFactory";
import type { AuroraLogger } from "@/lib/aurora/platform/services/AuroraLoggingService";
import { describe, expect, it } from "vitest";

class CaptureAuroraLogger implements AuroraLogger {
  readonly warnings: Array<{ message: string; meta?: Record<string, unknown> }> = [];

  error(): void {}

  warn(message: string, meta?: Record<string, unknown>): void {
    this.warnings.push({ message, meta });
  }

  info(): void {}

  debug(): void {}

  child(): AuroraLogger {
    return this;
  }
}

describe("production context safety", () => {
  it("defaults manual contexts to viewer permissions", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    expect(ctx.roles).toEqual(["aurora.viewer"]);
    expect(ctx.contextSource).toBe("test-manual");
    expect(ctx.auroraPermissions).toContain("aurora.content.read");
    expect(ctx.auroraPermissions).not.toContain("aurora.admin.tenant");
  });

  it("rejects manual viewer contexts for platform admin operations", () => {
    const service = new DefaultAuroraAuthorizationService();
    const ctx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "manual-viewer",
    });

    expect(() => service.assertPlatformAdmin(ctx)).toThrow(/platform admin permission required/i);
  });

  it("allows explicit test contexts for platform admin operations", () => {
    const service = new DefaultAuroraAuthorizationService();
    const ctx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "test-admin",
    });

    expect(() => service.assertPlatformAdmin(ctx)).not.toThrow();
  });

  it("allows session-bound production contexts for platform admin operations", () => {
    const service = new DefaultAuroraAuthorizationService();
    const ctx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "session-admin",
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.admin.tenant"],
      sessionId: "session-123",
      contextSource: "orion-session",
    });

    expect(() => service.assertPlatformAdmin(ctx)).not.toThrow();
  });
});

describe("permission denial audit logging", () => {
  it("logs warn entries when permission is denied", () => {
    const logger = new CaptureAuroraLogger();
    const service = new DefaultAuroraAuthorizationService({ logger });
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      auroraPermissions: ["aurora.content.read"],
    });

    expect(() =>
      service.assertPermission(ctx, "aurora.admin.tenant", { operation: "createTenant" }),
    ).toThrow();

    expect(logger.warnings).toHaveLength(1);
    expect(logger.warnings[0]?.message).toBe("Aurora authorization denied.");
    expect(logger.warnings[0]?.meta).toMatchObject({
      userId: "user-a",
      tenantId: "tenant-a",
      permission: "aurora.admin.tenant",
      operation: "createTenant",
    });
  });
});
