import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as GA4Health from "@/lib/providers/google-analytics/GA4Health";
import {
  createGoogleAnalyticsProvider,
  GoogleAnalyticsProvider,
} from "@/lib/providers/google-analytics/GoogleAnalyticsProvider";
import { createGA4FetchMock, testGA4Config } from "@/tests/fixtures/ga4";

describe("GoogleAnalyticsProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createGA4FetchMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes GA4 capabilities", () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    expect(provider.id).toBe("google-analytics");
    expect(provider.getCapabilities()).toEqual(
      expect.arrayContaining(["metrics", "alerts", "recommendations", "trends", "health", "brief"]),
    );
  });

  it("connects successfully when GA4 health check passes", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    const result = await provider.connect();

    expect(result.success).toBe(true);
    expect(result.data?.connected).toBe(true);
  });

  it("returns an error when connect health check fails", async () => {
    vi.stubGlobal(
      "fetch",
      createGA4FetchMock({
        reportStatus: 403,
        reportError: { message: "Forbidden" },
      }),
    );
    const provider = new GoogleAnalyticsProvider({ ...testGA4Config, maxRetries: 0 });

    const result = await provider.connect();

    expect(result.success).toBe(false);
    expect(result.error).toContain("not reachable");
  });

  it("reports disconnected health before connect", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    const result = await provider.healthCheck();

    expect(result.success).toBe(true);
    expect(result.data?.healthy).toBe(false);
    expect(result.data?.status).toBe("disconnected");
  });

  it("syncs metrics and returns dashboard contribution", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    await provider.connect();
    const syncResult = await provider.sync();

    expect(syncResult.success).toBe(true);

    const contribution = await provider.fetchDashboardContribution();

    expect(contribution.success).toBe(true);
    expect(contribution.data?.providerId).toBe("google-analytics");
    expect(contribution.data?.metric?.label).toBe("Marketing Metrics");
  });

  it("refresh delegates to sync", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);
    const syncSpy = vi.spyOn(provider, "sync");

    await provider.connect();
    await provider.refresh();

    expect(syncSpy).toHaveBeenCalled();
  });

  it("clears cache on disconnect", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    await provider.connect();
    await provider.sync();
    await provider.disconnect();

    await expect(provider.fetchDashboardContribution()).rejects.toThrow(/not connected/);
  });

  it("auto-syncs when fetching contribution without a snapshot", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    await provider.connect();

    const contribution = await provider.fetchDashboardContribution();

    expect(contribution.success).toBe(true);
    expect(contribution.data?.trends?.length).toBeGreaterThan(0);
  });

  it("serves stale snapshot when refresh fails but cached data exists", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", createGA4FetchMock());
    const provider = new GoogleAnalyticsProvider({
      ...testGA4Config,
      cacheTtlMs: 1,
      maxRetries: 0,
    });

    await provider.connect();
    await provider.sync();
    vi.advanceTimersByTime(5);

    vi.stubGlobal(
      "fetch",
      createGA4FetchMock({
        reportStatus: 500,
        reportError: { message: "Internal error" },
      }),
    );

    const promise = provider.fetchDashboardContribution();
    await vi.runAllTimersAsync();
    const contribution = await promise;

    expect(contribution.success).toBe(true);
    expect(contribution.data?.providerId).toBe("google-analytics");
    vi.useRealTimers();
  });

  it("reports connected health after a successful connect", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    await provider.connect();
    const result = await provider.healthCheck();

    expect(result.success).toBe(true);
    expect(result.data?.healthy).toBe(true);
    expect(result.data?.status).toBe("connected");
  });

  it("handles health check failures after connect", async () => {
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    await provider.connect();
    vi.spyOn(GA4Health, "runGA4HealthCheck").mockRejectedValueOnce(new Error("health failed"));

    const result = await provider.healthCheck();

    expect(result.success).toBe(true);
    expect(result.data?.healthy).toBe(false);
    expect(result.data?.status).toBe("error");
  });

  it("returns sync errors when contribution cannot be built", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", createGA4FetchMock());
    const provider = new GoogleAnalyticsProvider({ ...testGA4Config, maxRetries: 0 });

    await provider.connect();
    vi.stubGlobal(
      "fetch",
      createGA4FetchMock({
        reportStatus: 500,
        reportError: { message: "Internal error" },
      }),
    );

    const promise = provider.fetchDashboardContribution();
    await vi.runAllTimersAsync();
    const contribution = await promise;

    expect(contribution.success).toBe(false);
    expect(contribution.error).toBeTruthy();
    vi.useRealTimers();
  });

  it("handles unexpected connect failures", async () => {
    vi.spyOn(GA4Health, "runGA4HealthCheck").mockRejectedValueOnce(new Error("unexpected failure"));
    const provider = new GoogleAnalyticsProvider(testGA4Config);

    const result = await provider.connect();

    expect(result.success).toBe(false);
    expect(result.error).toBe("unexpected failure");
  });

  it("returns undefined from factory when config is invalid", () => {
    expect(createGoogleAnalyticsProvider()).toBeUndefined();
  });
});
