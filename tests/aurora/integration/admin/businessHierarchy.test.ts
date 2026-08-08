import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { AURORA_ERR_0403, AURORA_ERR_0429 } from "@/lib/aurora/errors/AuroraError";
import { createAuroraRuntimeContext, createTestAuroraRuntimeContext } from "@/lib/aurora/identity/AuroraContextFactory";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { createTestBusiness } from "@/tests/aurora/helpers/adminTestHelpers";
import { describe, expect, it } from "vitest";

describe("tenant hierarchy validation", () => {
  it("rejects brand creation when business is archived", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Hierarchy Tenant",
      slug: "hierarchy-tenant",
      tier: "professional",
    });
    const business = await createTestBusiness(wiring.repositories, tenant.id, { slug: "active-biz" });
    await wiring.repositories.business.update(tenant.id, business.id, { status: "archived" });

    const tenantCtx = createAuroraRuntimeContext({
      tenantId: tenant.id,
      userId: "tenant-admin",
      roles: ["aurora.admin"],
    });

    await expect(
      wiring.brandService.createBrand(tenantCtx, {
        tenantId: tenant.id,
        businessId: business.id,
        name: "Blocked Brand",
        slug: "blocked-brand",
      }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });

  it("rejects cross-business brand creation when context is business scoped", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Multi Business Tenant",
      slug: "multi-business-tenant",
      tier: "professional",
    });
    const businessA = await createTestBusiness(wiring.repositories, tenant.id, {
      slug: "business-a",
    });
    const businessB = await createTestBusiness(wiring.repositories, tenant.id, {
      slug: "business-b",
    });

    const scopedCtx = createAuroraRuntimeContext({
      tenantId: tenant.id,
      userId: "tenant-admin",
      roles: ["aurora.admin"],
      businessId: businessA.id,
    });

    await expect(
      wiring.brandService.createBrand(scopedCtx, {
        tenantId: tenant.id,
        businessId: businessB.id,
        name: "Wrong Business Brand",
        slug: "wrong-business-brand",
      }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });

  it("rejects brand creation for a business in another tenant", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenantA = await wiring.tenantService.createTenant(adminCtx, {
      name: "Tenant A",
      slug: "tenant-a-hierarchy",
    });
    const tenantB = await wiring.tenantService.createTenant(adminCtx, {
      name: "Tenant B",
      slug: "tenant-b-hierarchy",
    });
    const businessB = await createTestBusiness(wiring.repositories, tenantB.id, {
      slug: "tenant-b-business",
    });

    const tenantACtx = createAuroraRuntimeContext({
      tenantId: tenantA.id,
      userId: "tenant-a-admin",
      roles: ["aurora.admin"],
    });

    await expect(
      wiring.brandService.createBrand(tenantACtx, {
        tenantId: tenantA.id,
        businessId: businessB.id,
        name: "Cross Tenant Brand",
        slug: "cross-tenant-brand",
      }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });
});

describe("TierLimitService", () => {
  it("enforces starter tier brand limits through BrandService", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Starter Tenant",
      slug: "starter-tier-tenant",
      tier: "starter",
    });
    const business = await createTestBusiness(wiring.repositories, tenant.id, { slug: "starter-business" });

    const tenantCtx = createAuroraRuntimeContext({
      tenantId: tenant.id,
      userId: "tenant-admin",
      roles: ["aurora.admin"],
    });

    await wiring.brandService.createBrand(tenantCtx, {
      tenantId: tenant.id,
      businessId: business.id,
      name: "Only Brand",
      slug: "only-brand",
    });

    await expect(
      wiring.brandService.createBrand(tenantCtx, {
        tenantId: tenant.id,
        businessId: business.id,
        name: "Second Brand",
        slug: "second-brand",
      }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0429 });
  });
});
