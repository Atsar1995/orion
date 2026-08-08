import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { AURORA_ERR_0403 } from "@/lib/aurora/errors/AuroraError";
import {
  createAuroraRuntimeContext,
  createTestAuroraRuntimeContext,
} from "@/lib/aurora/identity/AuroraContextFactory";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { describe, expect, it } from "vitest";

describe("admin authorization unification", () => {
  it("permits platform admin tenant creation", async () => {
    const wiring = createTestAuroraWiring();
    const ctx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });

    const tenant = await wiring.tenantService.createTenant(ctx, {
      name: "Allowed Tenant",
      slug: "allowed-tenant",
    });

    expect(tenant.slug).toBe("allowed-tenant");
  });

  it("denies tenant creation without platform admin permission", async () => {
    const wiring = createTestAuroraWiring();
    const ctx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "viewer-admin",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.content.read"],
      contextSource: "test-manual",
    });

    await expect(
      wiring.tenantService.createTenant(ctx, { name: "Denied", slug: "denied-tenant" }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });

  it("rejects cross-tenant tenant updates", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Tenant B",
      slug: "tenant-b-auth",
    });

    const tenantACtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.admin.config", "aurora.content.read"],
    });

    await expect(
      wiring.tenantService.updateTenant(tenantACtx, tenant.id, { name: "Hacked" }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });

  it("requires aurora.admin.brand to create a brand", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Brand Tenant",
      slug: "brand-tenant-auth",
    });

    const editorCtx = createAuroraRuntimeContext({
      tenantId: tenant.id,
      userId: "editor",
      roles: ["aurora.editor"],
    });

    await expect(
      wiring.brandService.createBrand(editorCtx, {
        tenantId: tenant.id,
        name: "Primary",
        slug: "primary",
      }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });

  it("permits brand creation with aurora.admin.brand", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Brand Allowed",
      slug: "brand-allowed",
    });

    const tenantAdminCtx = createAuroraRuntimeContext({
      tenantId: tenant.id,
      userId: "tenant-admin",
      roles: ["aurora.admin"],
    });

    const brand = await wiring.brandService.createBrand(tenantAdminCtx, {
      tenantId: tenant.id,
      name: "Primary",
      slug: "primary",
    });

    expect(brand.slug).toBe("primary");
  });
});
