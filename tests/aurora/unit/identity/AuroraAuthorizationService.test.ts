import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { createAuroraRuntimeContext } from "@/lib/aurora/identity/AuroraContextFactory";
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { describe, expect, it } from "vitest";

describe("DefaultAuroraAuthorizationService", () => {
  const service = new DefaultAuroraAuthorizationService();

  it("hasPermission reflects auroraPermissions on context", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      auroraPermissions: ["aurora.content.read"],
    });

    expect(service.hasPermission(ctx, "aurora.content.read")).toBe(true);
    expect(service.hasPermission(ctx, "aurora.content.write")).toBe(false);
  });

  it("assertPermission passes when permission is granted", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      auroraPermissions: ["aurora.content.write"],
    });

    expect(() => service.assertPermission(ctx, "aurora.content.write")).not.toThrow();
  });

  it("assertPermission rejects missing permissions", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      auroraPermissions: ["aurora.content.read"],
    });

    expect(() => service.assertPermission(ctx, "aurora.admin.tenant")).toThrow(AuroraError);
    expect(() => service.assertPermission(ctx, "aurora.admin.tenant")).toThrow(
      expect.objectContaining({ code: AURORA_ERR_0403, statusCode: 403 }),
    );
  });

  it("denies admin permissions for aurora.agent.service identities", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "agent-a",
      roles: ["aurora.agent.service"],
      auroraPermissions: ["aurora.admin.tenant"],
    });

    expect(() => service.assertPermission(ctx, "aurora.admin.tenant")).toThrow(
      /agent service identity/i,
    );
  });

  it("assertBrandAccess requires a brand id", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    expect(() => service.assertBrandAccess(ctx, "")).toThrow(/brand scope required/i);
  });

  it("assertBrandAccess rejects mismatched brand scope", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      brandId: "brand-a",
    });

    expect(() => service.assertBrandAccess(ctx, "brand-b")).toThrow(/brand scope violation/i);
  });

  it("assertBrandAccess allows matching brand scope", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      brandId: "brand-a",
    });

    expect(() => service.assertBrandAccess(ctx, "brand-a")).not.toThrow();
  });

  it("assertTenantAccess allows platform admin on system tenant", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
      roles: ["aurora.admin"],
    });

    expect(() => service.assertTenantAccess(ctx, "tenant-b")).not.toThrow();
  });

  it("assertTenantAccess enforces tenant scope for non-admin contexts", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    expect(() => service.assertTenantAccess(ctx, "tenant-b")).toThrow(/tenant scope violation/i);
  });
});
