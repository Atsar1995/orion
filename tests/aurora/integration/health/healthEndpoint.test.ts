import { GET } from "@/app/api/aurora/health/route";
import { AURORA_ERR_0509 } from "@/lib/aurora/errors/AuroraError";
import { AuroraRuntime } from "@/lib/aurora/runtime/AuroraRuntime";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import {
  resetAuroraModuleForTests,
  setAuroraRuntimeForTests,
} from "@/lib/aurora/runtime/initializeAuroraModule";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("GET /api/aurora/health", () => {
  const originalEnabled = process.env.AURORA_ENABLED;

  beforeEach(() => {
    resetAuroraModuleForTests();
  });

  afterEach(() => {
    process.env.AURORA_ENABLED = originalEnabled;
    resetAuroraModuleForTests();
  });

  it("reports not initialized when Aurora is disabled", async () => {
    process.env.AURORA_ENABLED = "false";
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.data.lifecycle).toBe("created");
  });

  it("reflects actual runtime degraded state after boot", async () => {
    process.env.AURORA_ENABLED = "true";
    const runtime = new AuroraRuntime({
      ...AuroraRuntimeConfiguration.forTest(),
      platformStore: new InMemoryPlatformStore(),
      skipWorkers: true,
      skipExternalConnections: true,
    });
    await runtime.boot();
    setAuroraRuntimeForTests(runtime);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.lifecycle).toBe("degraded");
    expect(body.data.degradedReasons).toContain("Knowledge module stubbed.");
  });

  it("reports failed state from the initialized runtime", async () => {
    process.env.AURORA_ENABLED = "true";
    const runtime = new AuroraRuntime({
      ...AuroraRuntimeConfiguration.forTest(),
      platformStore: new InMemoryPlatformStore(),
      skipWorkers: true,
      skipExternalConnections: true,
      forceAdminInitFailure: true,
    });

    await expect(runtime.boot()).rejects.toMatchObject({ code: AURORA_ERR_0509 });
    setAuroraRuntimeForTests(runtime);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.data.lifecycle).toBe("failed");
  });
});
