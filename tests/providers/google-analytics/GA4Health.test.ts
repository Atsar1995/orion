import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GA4Client } from "@/lib/providers/google-analytics/GA4Client";
import { GA4HealthChecker, runGA4HealthCheck } from "@/lib/providers/google-analytics/GA4Health";
import { createGA4FetchMock, testGA4Config } from "@/tests/fixtures/ga4";

describe("GA4Health", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createGA4FetchMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports healthy status when property access succeeds", async () => {
    const client = new GA4Client(testGA4Config);

    const status = await runGA4HealthCheck(testGA4Config, client);

    expect(status.healthy).toBe(true);
    expect(status.authenticated).toBe(true);
    expect(status.propertyReachable).toBe(true);
    expect(status.message).toContain(testGA4Config.propertyId);
    expect(status.lastCheckedAt).toBeTruthy();
  });

  it("reports unhealthy status when property access fails", async () => {
    vi.stubGlobal(
      "fetch",
      createGA4FetchMock({
        reportStatus: 403,
        reportError: { message: "Forbidden" },
      }),
    );
    const client = new GA4Client({ ...testGA4Config, maxRetries: 0 });

    const status = await new GA4HealthChecker(testGA4Config, client).check();

    expect(status.healthy).toBe(false);
    expect(status.message).toContain("not reachable");
  });

  it("returns an error status when health check throws", async () => {
    const client = {
      probePropertyAccess: vi.fn().mockRejectedValue(new Error("network down")),
    } as unknown as GA4Client;

    const status = await runGA4HealthCheck(testGA4Config, client);

    expect(status.healthy).toBe(false);
    expect(status.message).toBe("network down");
  });
});
