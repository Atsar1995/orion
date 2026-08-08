import { DefaultAuroraIdentityBridge } from "@/lib/aurora/identity/AuroraIdentityBridge";
import { getAuroraApiContext } from "@/lib/aurora/identity/getAuroraApiContext";
import { AURORA_ERR_0403 } from "@/lib/aurora/errors/AuroraError";
import { ensureAuroraPlatformBacking } from "@/lib/aurora/persistence/AuroraPlatformBacking";
import { createAuroraRepositories } from "@/lib/aurora/persistence/createAuroraRepositories";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { describe, expect, it, vi } from "vitest";
import { createTestSession, TEST_ORG_ID } from "./testFixtures";

vi.mock("@/lib/identity/server-session", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "@/lib/identity/server-session";

async function createBridgeWithTenant() {
  const backing = ensureAuroraPlatformBacking(new InMemoryPlatformStore());
  const repositories = createAuroraRepositories(backing);
  await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });

  return new DefaultAuroraIdentityBridge({
    tenantRepository: repositories.tenant,
    brandRepository: repositories.brand,
    getLifecycleState: () => "ready",
  });
}

describe("getAuroraApiContext", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ session: null, profile: null });
    const bridge = await createBridgeWithTenant();

    await expect(getAuroraApiContext(bridge)).rejects.toMatchObject({
      code: AURORA_ERR_0403,
      statusCode: 403,
    });
  });

  it("builds Aurora context from the current ORION session", async () => {
    const session = createTestSession("executive");
    vi.mocked(getServerSession).mockResolvedValue({ session, profile: null });
    const bridge = await createBridgeWithTenant();

    const ctx = await getAuroraApiContext(bridge);

    expect(ctx.tenantId).toBe(TEST_ORG_ID);
    expect(ctx.roles).toEqual(["aurora.director"]);
    expect(ctx.workspaceId).toBe(session.user.workspaceId);
  });

  it("forwards brand scope to the identity bridge", async () => {
    const session = createTestSession("staff");
    vi.mocked(getServerSession).mockResolvedValue({ session, profile: null });

    const backing = ensureAuroraPlatformBacking(new InMemoryPlatformStore());
    const repositories = createAuroraRepositories(backing);
    await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });
    const brand = await repositories.brand.create("brand-primary", {
      tenantId: TEST_ORG_ID,
      name: "Primary",
      slug: "primary",
    });

    const bridge = new DefaultAuroraIdentityBridge({
      tenantRepository: repositories.tenant,
      brandRepository: repositories.brand,
      getLifecycleState: () => "ready",
    });

    const ctx = await getAuroraApiContext(bridge, { brandId: brand.id });
    expect(ctx.brandId).toBe(brand.id);
  });
});
