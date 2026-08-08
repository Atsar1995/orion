import type { ConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import { DefaultAuroraIdentityBridge } from "@/lib/aurora/identity/AuroraIdentityBridge";
import { AURORA_ERR_0404, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { ensureAuroraPlatformBacking } from "@/lib/aurora/persistence/AuroraPlatformBacking";
import { createAuroraRepositories } from "@/lib/aurora/persistence/createAuroraRepositories";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { describe, expect, it } from "vitest";
import { createTestSession, TEST_ORG_ID } from "./testFixtures";

function createBridge(platformState: "ready" | "degraded" = "ready") {
  const backing = ensureAuroraPlatformBacking(new InMemoryPlatformStore());
  const repositories = createAuroraRepositories(backing);

  return {
    bridge: new DefaultAuroraIdentityBridge({
      tenantRepository: repositories.tenant,
      brandRepository: repositories.brand,
      getLifecycleState: () => platformState,
    }),
    repositories,
  };
}

describe("DefaultAuroraIdentityBridge", () => {
  it("resolveUserIdentity maps ORION session fields and Aurora roles", async () => {
    const { bridge } = createBridge();
    const session = createTestSession("manager");

    const identity = await bridge.resolveUserIdentity(session);

    expect(identity.userId).toBe(session.user.id);
    expect(identity.orionOrganizationId).toBe(TEST_ORG_ID);
    expect(identity.orionWorkspaceId).toBe(session.user.workspaceId);
    expect(identity.auroraRoles).toEqual(["aurora.manager"]);
    expect(identity.auroraPermissions.has("aurora.approval.override")).toBe(true);
  });

  it("extends role permissions with ORION session grants", async () => {
    const { bridge } = createBridge();
    const session = createTestSession("read_only", {
      permissions: [{ module: "aurora", action: "content.write" }],
    });

    const identity = await bridge.resolveUserIdentity(session);
    expect(identity.auroraPermissions.has("aurora.content.read")).toBe(true);
    expect(identity.auroraPermissions.has("aurora.content.write")).toBe(true);
  });

  it("buildContext returns runtime context scoped to tenant and workspace", async () => {
    const { bridge, repositories } = createBridge();
    await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });
    const session = createTestSession("organization_admin");

    const ctx = await bridge.buildContext(session);

    expect(ctx.tenantId).toBe(TEST_ORG_ID);
    expect(ctx.orionOrganizationId).toBe(TEST_ORG_ID);
    expect(ctx.workspaceId).toBe(session.user.workspaceId);
    expect(ctx.roles).toEqual(["aurora.admin"]);
    expect(ctx.platformState).toBe("ready");
  });

  it("buildContext rejects unknown tenants", async () => {
    const { bridge } = createBridge();
    const session = createTestSession("staff");

    await expect(bridge.buildContext(session)).rejects.toMatchObject({
      code: AURORA_ERR_0404,
      statusCode: 404,
    });
  });

  it("buildContext validates brand scope when brandId is supplied", async () => {
    const { bridge, repositories } = createBridge();
    await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });
    const session = createTestSession("staff");

    await expect(bridge.buildContext(session, "missing-brand")).rejects.toMatchObject({
      code: AURORA_ERR_0404,
    });
  });

  it("buildContext accepts an existing brand id", async () => {
    const { bridge, repositories } = createBridge();
    await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });
    const brand = await repositories.brand.create("brand-primary", {
      tenantId: TEST_ORG_ID,
      name: "Primary",
      slug: "primary",
    });
    const session = createTestSession("staff");

    const ctx = await bridge.buildContext(session, brand.id);
    expect(ctx.brandId).toBe(brand.id);
  });

  it("resolveTenant reads from tenant repository", async () => {
    const { bridge, repositories } = createBridge();
    await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });

    const tenant = await bridge.resolveTenant(TEST_ORG_ID);
    expect(tenant?.slug).toBe("acme");
  });

  it("merges feature flags from configuration service when wired", async () => {
    const backing = ensureAuroraPlatformBacking(new InMemoryPlatformStore());
    const repositories = createAuroraRepositories(backing);
    await repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });

    const bridge = new DefaultAuroraIdentityBridge({
      tenantRepository: repositories.tenant,
      brandRepository: repositories.brand,
      getLifecycleState: () => "ready",
      configurationService: {
        getFeatureFlags: async () => ({ betaDashboard: true }),
      } as unknown as ConfigurationService,
    });

    const ctx = await bridge.buildContext(createTestSession("read_only"));
    expect(ctx.featureFlags).toEqual({ betaDashboard: true });
  });

  it("throws AuroraError instances for bridge failures", async () => {
    const { bridge } = createBridge();

    try {
      await bridge.buildContext(createTestSession("guest"));
      throw new Error("expected failure");
    } catch (error) {
      expect(error).toBeInstanceOf(AuroraError);
    }
  });
});
