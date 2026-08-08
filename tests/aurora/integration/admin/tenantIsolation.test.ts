import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { AURORA_ERR_0403 } from "@/lib/aurora/errors/AuroraError";
import { AuroraRecovery } from "@/lib/aurora/runtime/AuroraRecovery";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import { createAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { describe, expect, it } from "vitest";

describe("Warm Restart (P-011.2 pattern)", () => {
  it("preserves tenant data across shutdown and boot", async () => {
    const config = {
      ...AuroraRuntimeConfiguration.forTest(),
      platformStore: new InMemoryPlatformStore(),
      skipWorkers: true,
      skipExternalConnections: true,
    };

    let tenantId = "";

    await AuroraRecovery.verifyWarmRestart(
      config,
      async (wiring) => {
        const ctx = createAuroraRuntimeContext({
          tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
          userId: "user-restart",
        });
        const tenant = await wiring.facade.admin.createTenant(ctx, {
          name: "Restart Tenant",
          slug: "restart-tenant",
        });
        tenantId = tenant.id;
      },
      async (wiring) => {
        const ctx = createAuroraRuntimeContext({
          tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
          userId: "user-restart",
        });
        const restored = await wiring.facade.admin.getTenant(ctx, tenantId);
        expect(restored?.slug).toBe("restart-tenant");
      },
    );
  });
});

describe("tenant isolation", () => {
  it("rejects cross-tenant updates", async () => {
    const config = {
      ...AuroraRuntimeConfiguration.forTest(),
      platformStore: new InMemoryPlatformStore(),
      skipWorkers: true,
      skipExternalConnections: true,
      initialLifecycle: "ready" as const,
    };
    const { createTestAuroraWiring } = await import("@/lib/aurora/wiring/createTestAuroraWiring");
    const wiring = createTestAuroraWiring(config);
    const adminCtx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Tenant B",
      slug: "tenant-b-isolation",
    });

    const tenantACtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    await expect(
      wiring.tenantService.updateTenant(tenantACtx, tenant.id, { name: "Hacked" }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });

  it("rejects cross-tenant brand listing", async () => {
    const { createTestAuroraWiring } = await import("@/lib/aurora/wiring/createTestAuroraWiring");
    const wiring = createTestAuroraWiring();
    const adminCtx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Brand Tenant",
      slug: "brand-tenant",
    });

    const tenantACtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    await expect(wiring.brandService.listBrands(tenantACtx, tenant.id)).rejects.toMatchObject({
      code: AURORA_ERR_0403,
    });
  });

  it("rejects creating a brand under another tenant", async () => {
    const { createTestAuroraWiring } = await import("@/lib/aurora/wiring/createTestAuroraWiring");
    const wiring = createTestAuroraWiring();
    const adminCtx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Brand Target",
      slug: "brand-target",
    });

    const tenantACtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
      roles: ["aurora.editor"],
    });

    await expect(
      wiring.brandService.createBrand(tenantACtx, {
        tenantId: tenant.id,
        name: "Sneaky Brand",
        slug: "sneaky",
      }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403 });
  });
});
