import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { AURORA_EVENT_TENANT_PROVISIONED } from "@/lib/aurora/events/aurora-event-catalog";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/identity/AuroraContextFactory";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { describe, expect, it, vi } from "vitest";

describe("TenantProvisioningService", () => {
  it("provisions tenant, default business, and default brand atomically", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const orgId = "org-provision-success";

    const published: string[] = [];
    vi.spyOn(wiring.eventPublisher, "publish").mockImplementation(async (event) => {
      published.push(event.name);
    });

    const result = await wiring.tenantProvisioningService.provision(adminCtx, {
      orionOrganizationId: orgId,
      name: "Provisioned Co",
      tier: "starter",
      defaultBrandName: "Primary Brand",
      slug: "provisioned-co",
    });

    expect(result.tenant.status).toBe("active");
    expect(result.tenant.id).toBe(orgId);
    expect(result.defaultBusiness.slug).toBe("default");
    expect(result.defaultBusiness.tenantId).toBe(orgId);
    expect(result.defaultBrand.businessId).toBe(result.defaultBusiness.id);
    expect(result.defaultBrand.tenantId).toBe(orgId);
    expect(published).toContain(AURORA_EVENT_TENANT_PROVISIONED);

    const storedTenant = await wiring.repositories.tenant.getById(orgId);
    expect(storedTenant?.status).toBe("active");
    expect(await wiring.repositories.business.listByTenant(orgId)).toHaveLength(1);
    expect(await wiring.repositories.brand.listByTenant(orgId)).toHaveLength(1);
  });

  it("rolls back partial provisioning when brand creation fails", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const orgId = "org-provision-rollback";

    vi.spyOn(wiring.repositories.brand, "create").mockRejectedValueOnce(
      new Error("simulated brand failure"),
    );

    await expect(
      wiring.tenantProvisioningService.provision(adminCtx, {
        orionOrganizationId: orgId,
        name: "Rollback Co",
        tier: "starter",
        defaultBrandName: "Primary Brand",
        slug: "rollback-co",
      }),
    ).rejects.toThrow(/simulated brand failure/i);

    expect(await wiring.repositories.tenant.getById(orgId)).toBeNull();
    expect(await wiring.repositories.business.listByTenant(orgId)).toHaveLength(0);
    expect(await wiring.repositories.brand.listByTenant(orgId)).toHaveLength(0);
  });

  it("rejects duplicate provisioning for the same ORION organization", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "platform-admin",
    });
    const orgId = "org-provision-duplicate";
    const input = {
      orionOrganizationId: orgId,
      name: "Duplicate Co",
      tier: "starter" as const,
      defaultBrandName: "Primary Brand",
      slug: "duplicate-co",
    };

    await wiring.tenantProvisioningService.provision(adminCtx, input);

    await expect(wiring.tenantProvisioningService.provision(adminCtx, input)).rejects.toMatchObject({
      code: "AURORA_ERR_0409",
    });
  });
});
