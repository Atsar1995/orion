import { describe, expect, it } from "vitest";
import { AuroraRecovery } from "@/lib/aurora/runtime/AuroraRecovery";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import { createAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";

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
          tenantId: "tenant-restart",
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
          tenantId: "tenant-restart",
          userId: "user-restart",
        });
        const restored = await wiring.facade.admin.getTenant(ctx, tenantId);
        expect(restored?.slug).toBe("restart-tenant");
      },
    );
  });
});
