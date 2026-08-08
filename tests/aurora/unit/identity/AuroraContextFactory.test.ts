import {
  createAuroraRuntimeContext,
  createTestAuroraRuntimeContext,
  permissionsToArray,
  withBrandContext,
} from "@/lib/aurora/identity/AuroraContextFactory";
import { describe, expect, it } from "vitest";

describe("createAuroraRuntimeContext", () => {
  it("defaults organization and workspace fields from tenant scope", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    expect(ctx.orionOrganizationId).toBe("tenant-a");
    expect(ctx.workspaceId).toBe("");
    expect(ctx.businessId).toBe("tenant-a");
  });

  it("derives auroraPermissions from roles when not supplied", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      roles: ["aurora.viewer"],
    });

    expect(ctx.auroraPermissions).toContain("aurora.content.read");
    expect(ctx.auroraPermissions).not.toContain("aurora.content.write");
  });

  it("preserves explicit auroraPermissions", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.content.write"],
    });

    expect(ctx.auroraPermissions).toEqual(["aurora.content.write"]);
  });

  it("marks explicit test contexts for WP-A001 regression helpers", () => {
    const ctx = createTestAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    expect(ctx.roles).toEqual(["aurora.admin"]);
    expect(ctx.contextSource).toBe("test-manual");
  });
});

describe("withBrandContext", () => {
  it("returns a copy with the brand id replaced", () => {
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      brandId: "",
    });

    const scoped = withBrandContext(ctx, "brand-1");
    expect(scoped.brandId).toBe("brand-1");
    expect(ctx.brandId).toBe("");
  });
});

describe("permissionsToArray", () => {
  it("copies readonly arrays unchanged", () => {
    const permissions = ["aurora.content.read"] as const;
    expect(permissionsToArray(permissions)).toEqual(["aurora.content.read"]);
  });

  it("materializes permission sets", () => {
    const permissions = new Set(["aurora.content.read", "aurora.content.write"] as const);
    expect(permissionsToArray(permissions)).toEqual(
      expect.arrayContaining(["aurora.content.read", "aurora.content.write"]),
    );
  });
});
