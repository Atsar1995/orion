import { describe, expect, it } from "vitest";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { createAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

describe("createAuroraWiring", () => {
  it("wires platform foundation against InMemoryPlatformStore", () => {
    const wiring = createTestAuroraWiring();
    expect(wiring.platformStore).toBeDefined();
    expect(wiring.backing).toBe(wiring.platformStore.getAuroraBacking());
    expect(wiring.tenantService).toBeDefined();
    expect(wiring.facade.admin).toBeDefined();
    expect(wiring.lifecycle).toBe("ready");
  });

  it("exposes admin operations through facade", async () => {
    const wiring = createTestAuroraWiring();
    const ctx = createAuroraRuntimeContext({
      tenantId: "tenant-test",
      userId: "user-test",
    });

    const tenant = await wiring.facade.admin.createTenant(ctx, {
      name: "Acme",
      slug: "acme",
    });

    expect(tenant.slug).toBe("acme");
  });

  it("returns 501 stubs for deferred modules", () => {
    const wiring = createTestAuroraWiring();
    expect(() => (wiring.facade.content as unknown as { create: () => void }).create()).toThrow(
      /not implemented/i,
    );
  });
});
