import { DefaultAuroraIdentityBridge } from "@/lib/aurora/identity/AuroraIdentityBridge";
import { AURORA_ERR_0403, AURORA_ERR_0404 } from "@/lib/aurora/errors/AuroraError";
import { ensureAuroraPlatformBacking } from "@/lib/aurora/persistence/AuroraPlatformBacking";
import { createAuroraRepositories } from "@/lib/aurora/persistence/createAuroraRepositories";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { describe, expect, it } from "vitest";
import { createTestSession, TEST_ORG_ID } from "./testFixtures";

function createBridge() {
  const backing = ensureAuroraPlatformBacking(new InMemoryPlatformStore());
  const repositories = createAuroraRepositories(backing);
  return {
    bridge: new DefaultAuroraIdentityBridge({
      tenantRepository: repositories.tenant,
      brandRepository: repositories.brand,
      getLifecycleState: () => "ready",
    }),
    repositories,
  };
}

describe("active tenant validation", () => {
  it("allows active tenants", async () => {
    const { bridge, repositories } = createBridge();
    await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });

    const tenant = await bridge.resolveTenant(TEST_ORG_ID);
    expect(tenant?.status).toBe("active");
    await expect(bridge.buildContext(createTestSession("staff"))).resolves.toBeDefined();
  });

  it("denies suspended tenants", async () => {
    const { bridge, repositories } = createBridge();
    await repositories.tenant.create(TEST_ORG_ID, {
      name: "Acme",
      slug: "acme-suspended",
    });
    await repositories.tenant.update(TEST_ORG_ID, { status: "suspended" });

    await expect(bridge.resolveTenant(TEST_ORG_ID)).rejects.toMatchObject({
      code: AURORA_ERR_0403,
      statusCode: 403,
    });
    await expect(bridge.buildContext(createTestSession("staff"))).rejects.toMatchObject({
      code: AURORA_ERR_0403,
    });
  });

  it("preserves missing tenant as 404 during context build", async () => {
    const { bridge } = createBridge();
    await expect(bridge.buildContext(createTestSession("guest"))).rejects.toMatchObject({
      code: AURORA_ERR_0404,
      statusCode: 404,
    });
  });
});
