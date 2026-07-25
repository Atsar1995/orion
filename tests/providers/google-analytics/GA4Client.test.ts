import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GA4Client } from "@/lib/providers/google-analytics/GA4Client";
import {
  createCoreMetricsReportResponse,
  createGA4FetchMock,
  createTestSnapshot,
  testGA4Config,
} from "@/tests/fixtures/ga4";

describe("GA4Client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", createGA4FetchMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches a full metrics snapshot from the GA4 Data API", async () => {
    const client = new GA4Client(testGA4Config);

    const snapshot = await client.fetchMetricsSnapshot(true);

    expect(snapshot.propertyId).toBe(testGA4Config.propertyId);
    expect(snapshot.comparison.current.sessions).toBe(1000);
    expect(snapshot.trafficSources[0]?.source).toBe("google");
    expect(snapshot.campaigns[0]?.campaign).toBe("spring-sale");
    expect(snapshot.devices[0]?.category).toBe("mobile");
    expect(snapshot.geography[0]?.country).toBe("India");
    expect(snapshot.landingPages[0]?.path).toBe("/home");
    expect(snapshot.topPages[0]?.path).toBe("/pricing");
  });

  it("returns cached snapshots without refetching", async () => {
    const fetchMock = createGA4FetchMock();
    vi.stubGlobal("fetch", fetchMock);
    const client = new GA4Client(testGA4Config);

    await client.fetchMetricsSnapshot(true);
    const runReportCallsAfterFirst = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes(":runReport"),
    ).length;

    const cached = await client.fetchMetricsSnapshot(false);

    expect(cached.comparison.current.sessions).toBe(1000);
    expect(
      fetchMock.mock.calls.filter((call) => String(call[0]).includes(":runReport")).length,
    ).toBe(runReportCallsAfterFirst);
  });

  it("invalidates cache and refetches when forceRefresh is true", async () => {
    const fetchMock = createGA4FetchMock();
    vi.stubGlobal("fetch", fetchMock);
    const client = new GA4Client(testGA4Config);

    await client.fetchMetricsSnapshot(true);
    await client.fetchMetricsSnapshot(true);

    const runReportCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes(":runReport"),
    ).length;
    expect(runReportCalls).toBeGreaterThanOrEqual(16);
  });

  it("stores snapshots in the exposed cache", async () => {
    const client = new GA4Client(testGA4Config);

    await client.fetchMetricsSnapshot(true);

    const cached = client.getCache().getSnapshot(testGA4Config.propertyId);
    expect(cached?.propertyId).toBe(testGA4Config.propertyId);
  });

  it("returns true when property access probe succeeds", async () => {
    const client = new GA4Client(testGA4Config);

    await expect(client.probePropertyAccess()).resolves.toBe(true);
  });

  it("returns false when property access probe fails", async () => {
    vi.stubGlobal(
      "fetch",
      createGA4FetchMock({
        reportStatus: 403,
        reportError: { message: "Forbidden" },
      }),
    );
    const client = new GA4Client({ ...testGA4Config, maxRetries: 0 });

    await expect(client.probePropertyAccess()).resolves.toBe(false);
  });

  it("retries on rate limit responses", async () => {
    vi.useFakeTimers();
    const fetchMock = createGA4FetchMock({
      reportStatus: (callIndex) => (callIndex === 1 ? 429 : 200),
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = new GA4Client({ ...testGA4Config, maxRetries: 2 });

    const promise = client.probePropertyAccess();
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe(true);
    vi.useRealTimers();
  });

  it("invalidates OAuth token and retries after 401 responses", async () => {
    vi.useFakeTimers();
    const fetchMock = createGA4FetchMock({ unauthorizedOnce: true });
    vi.stubGlobal("fetch", fetchMock);
    const client = new GA4Client({ ...testGA4Config, maxRetries: 2 });

    const promise = client.probePropertyAccess();
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe(true);

    const oauthCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("oauth2.googleapis.com/token"),
    ).length;
    expect(oauthCalls).toBeGreaterThanOrEqual(2);
    vi.useRealTimers();
  });

  it("returns false after exhausting retries", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      createGA4FetchMock({
        reportStatus: 500,
        reportError: { message: "Internal error" },
      }),
    );
    const client = new GA4Client({ ...testGA4Config, maxRetries: 1 });

    const promise = client.probePropertyAccess();
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe(false);
    vi.useRealTimers();
  });

  it("normalizes empty and invalid metric values", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        if (String(url).includes("oauth2.googleapis.com/token")) {
          return new Response(
            JSON.stringify({ access_token: "token", expires_in: 3600, token_type: "Bearer" }),
            { status: 200 },
          );
        }

        return new Response(
          JSON.stringify(
            createCoreMetricsReportResponse({
              sessions: "(not set)",
              totalUsers: "not-a-number",
            }),
          ),
          { status: 200 },
        );
      }),
    );

    const client = new GA4Client(testGA4Config);
    const snapshot = await client.fetchMetricsSnapshot(true);

    expect(snapshot.comparison.current.sessions).toBe(0);
    expect(snapshot.comparison.current.users).toBe(0);
  });

  it("handles report responses with no rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        if (String(url).includes("oauth2.googleapis.com/token")) {
          return new Response(
            JSON.stringify({ access_token: "token", expires_in: 3600, token_type: "Bearer" }),
            { status: 200 },
          );
        }

        return new Response(JSON.stringify({ metricHeaders: [{ name: "sessions" }], rows: [] }), {
          status: 200,
        });
      }),
    );

    const client = new GA4Client(testGA4Config);
    const snapshot = await client.fetchMetricsSnapshot(true);

    expect(snapshot.comparison.current.sessions).toBe(0);
    expect(snapshot.comparison.previous.sessions).toBe(0);
  });

  it("prefills cached snapshot for subsequent reads", async () => {
    const client = new GA4Client(testGA4Config);
    const cache = client.getCache();
    const snapshot = createTestSnapshot();

    cache.setSnapshot(testGA4Config.propertyId, snapshot);

    await expect(client.fetchMetricsSnapshot(false)).resolves.toEqual(snapshot);
  });
});
