import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { AURORA_ERR_0403, AURORA_ERR_0404 } from "@/lib/aurora/errors/AuroraError";
import { createAuroraRuntimeContext, createTestAuroraRuntimeContext } from "@/lib/aurora/identity/AuroraContextFactory";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { createTestBusiness } from "@/tests/aurora/helpers/adminTestHelpers";
import { describe, expect, it } from "vitest";

describe("BusinessEntityService", () => {
  it("creates, reads, updates, and archives a business within tenant scope", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Business Tenant",
      slug: "business-tenant",
    });

    const tenantCtx = createAuroraRuntimeContext({
      tenantId: tenant.id,
      userId: "tenant-admin",
      roles: ["aurora.admin"],
    });

    const created = await wiring.businessEntityService.createBusiness(tenantCtx, {
      tenantId: tenant.id,
      name: "Retail",
      slug: "retail",
    });
    expect(created.status).toBe("active");

    const fetched = await wiring.businessEntityService.getBusiness(tenantCtx, created.id);
    expect(fetched?.slug).toBe("retail");

    const businesses = await wiring.businessEntityService.listBusinesses(tenantCtx, tenant.id);
    expect(businesses).toHaveLength(1);

    const updated = await wiring.businessEntityService.updateBusiness(tenantCtx, created.id, {
      name: "Retail Updated",
    });
    expect(updated.name).toBe("Retail Updated");

    const archived = await wiring.businessEntityService.archiveBusiness(tenantCtx, created.id);
    expect(archived.status).toBe("archived");
  });

  it("rejects cross-tenant business reads", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Scoped Tenant",
      slug: "scoped-tenant",
    });
    const business = await createTestBusiness(wiring.repositories, tenant.id, {
      slug: "scoped-business",
    });

    const otherTenantCtx = createAuroraRuntimeContext({
      tenantId: "tenant-other",
      userId: "other-user",
      roles: ["aurora.admin"],
    });

    await expect(
      wiring.businessEntityService.getBusiness(otherTenantCtx, business.id),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });

  it("returns null for unknown business ids in tenant scope", async () => {
    const wiring = createTestAuroraWiring();
    const tenantCtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      roles: ["aurora.admin"],
    });

    const result = await wiring.businessEntityService.getBusiness(tenantCtx, "missing-business");
    expect(result).toBeNull();
  });

  it("rejects business updates when the record is missing", async () => {
    const wiring = createTestAuroraWiring();
    const tenantCtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      roles: ["aurora.admin"],
    });

    await expect(
      wiring.businessEntityService.updateBusiness(tenantCtx, "missing-business", { name: "X" }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0404 });
  });
});
