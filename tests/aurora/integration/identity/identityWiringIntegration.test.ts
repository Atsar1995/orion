import { DefaultAuroraIdentityBridge } from "@/lib/aurora/identity/AuroraIdentityBridge";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { describe, expect, it } from "vitest";
import { createTestSession, TEST_ORG_ID } from "../../unit/identity/testFixtures";

describe("identity wiring integration", () => {
  it("runs session → bridge → authorization on the composition root", async () => {
    const wiring = createTestAuroraWiring();
    await wiring.repositories.tenant.create(TEST_ORG_ID, { name: "Acme", slug: "acme" });

    const session = createTestSession("organization_admin", {
      permissions: [{ module: "aurora", action: "integration.manage" }],
    });
    const ctx = await wiring.identityBridge.buildContext(session);

    expect(ctx.contextSource).toBe("orion-session");
    expect(ctx.tenantId).toBe(TEST_ORG_ID);
    expect(() =>
      wiring.authorizationService.assertPermission(ctx, "aurora.admin.brand", {
        operation: "createBrand",
      }),
    ).not.toThrow();
    expect(() =>
      wiring.authorizationService.assertPermission(ctx, "aurora.integration.manage", {
        operation: "manageIntegration",
      }),
    ).not.toThrow();

    const viewerSession = createTestSession("read_only");
    const viewerCtx = await wiring.identityBridge.buildContext(viewerSession);
    expect(() =>
      wiring.authorizationService.assertPermission(viewerCtx, "aurora.admin.tenant", {
        operation: "listTenants",
      }),
    ).toThrow();
  });

  it("exposes the same authorization service used by admin services", () => {
    const wiring = createTestAuroraWiring();
    expect(wiring.authorizationService).toBeDefined();
    expect(wiring.identityBridge).toBeInstanceOf(DefaultAuroraIdentityBridge);
  });
});
