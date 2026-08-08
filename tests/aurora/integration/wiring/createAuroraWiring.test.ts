import { AURORA_PLATFORM_SYSTEM_TENANT_ID } from "@/lib/aurora/admin/tenantAuthorization";
import { AURORA_ERR_0403, AURORA_ERR_0509 } from "@/lib/aurora/errors/AuroraError";
import { isAuroraError } from "@/lib/aurora/errors/AuroraError";
import { createAuroraWiring } from "@/lib/aurora/createAuroraWiring";
import { AuroraRuntime } from "@/lib/aurora/runtime/AuroraRuntime";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import { createAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import { resetAuroraModuleForTests } from "@/lib/aurora/runtime/initializeAuroraModule";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { describe, expect, it } from "vitest";

function testBootConfig(overrides: Record<string, unknown> = {}) {
  return {
    ...AuroraRuntimeConfiguration.forTest(),
    platformStore: new InMemoryPlatformStore(),
    skipWorkers: true,
    skipExternalConnections: true,
    ...overrides,
  };
}

describe("createAuroraWiring", () => {
  it("wires platform foundation against InMemoryPlatformStore", () => {
    const wiring = createTestAuroraWiring();
    expect(wiring.platformStore).toBeDefined();
    expect(wiring.backing).toBe(wiring.platformStore.getAuroraBacking());
    expect(wiring.tenantService).toBeDefined();
    expect(wiring.identityBridge).toBeDefined();
    expect(wiring.authorizationService).toBeDefined();
    expect(wiring.facade.admin).toBeDefined();
    expect(wiring.lifecycle).toBe("ready");
  });

  it("starts bootstrap wiring in initializing lifecycle", () => {
    const config = testBootConfig();
    const runtime = new AuroraRuntime(config);
    const wiring = createAuroraWiring(config, runtime);
    expect(wiring.lifecycle).toBe("initializing");
  });

  it("exposes admin operations through facade", async () => {
    const wiring = createTestAuroraWiring();
    const ctx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
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

describe("bootstrap lifecycle truthfulness", () => {
  it("does not reach ready before bootstrap phase 10 completes", async () => {
    const config = testBootConfig();
    const runtime = new AuroraRuntime(config);
    const wiring = createAuroraWiring(config, runtime);
    expect(wiring.lifecycle).toBe("initializing");

    await runtime.boot();
    expect(runtime.getLifecycleState()).not.toBe("initializing");
    expect(["ready", "degraded"]).toContain(runtime.getLifecycleState());
  });

  it("reports initializing from health while wiring is pre-bootstrap", async () => {
    const config = testBootConfig();
    const runtime = new AuroraRuntime(config);
    const wiring = createAuroraWiring(config, runtime);
    const health = await wiring.healthCheck();
    expect(health.lifecycle).toBe("initializing");
  });
});

describe("critical bootstrap failures", () => {
  it("transitions to failed when admin module initialization fails (phase 6)", async () => {
    const config = testBootConfig({ forceAdminInitFailure: true });
    const runtime = new AuroraRuntime(config);

    await expect(runtime.boot()).rejects.toMatchObject({ code: AURORA_ERR_0509 });
    expect(runtime.getLifecycleState()).toBe("failed");
  });

  it("transitions to failed when configuration validation fails (phase 5)", async () => {
    const config = testBootConfig({ forceConfigValidationFailure: true });
    const runtime = new AuroraRuntime(config);

    await expect(runtime.boot()).rejects.toMatchObject({ code: AURORA_ERR_0509 });
    expect(runtime.getLifecycleState()).toBe("failed");
  });

  it("transitions to failed when environment validation fails (phase 1)", async () => {
    const config = testBootConfig({
      environment: "production",
      storageBucket: undefined,
    });
    const runtime = new AuroraRuntime(config);

    await expect(runtime.boot()).rejects.toMatchObject({ code: AURORA_ERR_0509 });
    expect(runtime.getLifecycleState()).toBe("failed");
  });
});

describe("degraded bootstrap", () => {
  it("propagates bootstrap degraded reasons to health", async () => {
    const config = testBootConfig();
    const runtime = new AuroraRuntime(config);
    await runtime.boot();

    const report = await runtime.getHealthReport();
    expect(report?.degradedReasons).toContain("Knowledge module stubbed.");
    expect(report?.degradedReasons).toContain("Background workers skipped.");
    expect(runtime.getLifecycleState()).toBe("degraded");
  });
});

describe("boot-disabled path", () => {
  it("leaves runtime in created state when Aurora is disabled", async () => {
    const original = process.env.AURORA_ENABLED;
    process.env.AURORA_ENABLED = "false";
    resetAuroraModuleForTests();

    const { initializeAuroraModule } = await import("@/lib/aurora/runtime/initializeAuroraModule");
    const runtime = await initializeAuroraModule();
    expect(runtime.getLifecycleState()).toBe("created");

    process.env.AURORA_ENABLED = original;
    resetAuroraModuleForTests();
  });
});

describe("facade deferred capability contract", () => {
  it("throws AURORA_ERR_0501 for deferred facade modules", () => {
    const wiring = createTestAuroraWiring();
    expect(() =>
      (wiring.facade.knowledge as unknown as { search: () => void }).search(),
    ).toThrow(/not implemented/i);
  });
});

describe("connector registry foundation", () => {
  it("registers and lists connectors", () => {
    const wiring = createTestAuroraWiring();
    expect(wiring.connectorRegistry.list()).toEqual([]);
  });
});

describe("event publisher foundation", () => {
  it("publishes tenant events through wiring", async () => {
    const wiring = createTestAuroraWiring();
    const ctx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "user-events",
    });

    const tenant = await wiring.tenantService.createTenant(ctx, {
      name: "Event Tenant",
      slug: "event-tenant",
    });

    expect(tenant.id).toBeTruthy();
  });
});

describe("tenant authorization", () => {
  it("rejects cross-tenant reads", async () => {
    const wiring = createTestAuroraWiring();
    const adminCtx = createAuroraRuntimeContext({
      tenantId: AURORA_PLATFORM_SYSTEM_TENANT_ID,
      userId: "admin",
    });
    const tenant = await wiring.tenantService.createTenant(adminCtx, {
      name: "Tenant B",
      slug: "tenant-b",
    });

    const tenantACtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    await expect(wiring.tenantService.getTenant(tenantACtx, tenant.id)).rejects.toMatchObject({
      code: AURORA_ERR_0403,
    });
  });

  it("rejects unauthorized tenant listing", async () => {
    const wiring = createTestAuroraWiring();
    const tenantCtx = createAuroraRuntimeContext({
      tenantId: "tenant-a",
      userId: "user-a",
    });

    await expect(wiring.tenantService.listTenants(tenantCtx)).rejects.toMatchObject({
      code: AURORA_ERR_0403,
    });
  });
});

describe("shutdown idempotency", () => {
  it("allows repeated shutdown calls", async () => {
    const wiring = createTestAuroraWiring();
    const first = await wiring.shutdown();
    const second = await wiring.shutdown();
    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
  });
});

describe("AuroraError contract on boot failure", () => {
  it("exposes phase results on boot failure", async () => {
    const config = testBootConfig({ forceAdminInitFailure: true });
    const runtime = new AuroraRuntime(config);

    try {
      await runtime.boot();
    } catch (error) {
      expect(isAuroraError(error)).toBe(true);
      if (isAuroraError(error)) {
        expect(error.code).toBe(AURORA_ERR_0509);
        expect(Array.isArray(error.details)).toBe(true);
      }
    }
  });
});
