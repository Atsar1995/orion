import { vi } from "vitest";
import type { GA4Config, GA4MetricsSnapshot } from "@/types/google-analytics";

export const testGA4Config: GA4Config = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  refreshToken: "test-refresh-token",
  propertyId: "123456789",
  cacheTtlMs: 60_000,
  maxRetries: 2,
  requestTimeoutMs: 5_000,
};

export const ga4EnvVars: Record<string, string> = {
  GOOGLE_ANALYTICS_CLIENT_ID: testGA4Config.clientId,
  GOOGLE_ANALYTICS_CLIENT_SECRET: testGA4Config.clientSecret,
  GOOGLE_ANALYTICS_REFRESH_TOKEN: testGA4Config.refreshToken,
  GOOGLE_ANALYTICS_PROPERTY_ID: testGA4Config.propertyId,
};

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: init?.headers,
  });
}

export function createOAuthTokenResponse(accessToken = "mock-access-token"): Response {
  return jsonResponse({
    access_token: accessToken,
    expires_in: 3600,
    token_type: "Bearer",
  });
}

export function createCoreMetricsReportResponse(
  values: Partial<Record<string, string>> = {},
): Record<string, unknown> {
  const defaults: Record<string, string> = {
    sessions: "1000",
    totalUsers: "800",
    activeUsers: "750",
    newUsers: "200",
    screenPageViews: "2500",
    purchaseRevenue: "50000",
    transactions: "25",
    conversions: "100",
    bounceRate: "0.45",
    engagementRate: "0.55",
    averageSessionDuration: "120",
  };
  const merged = { ...defaults, ...values };
  const metricNames = Object.keys(merged);

  return {
    metricHeaders: metricNames.map((name) => ({ name })),
    rows: [
      {
        metricValues: metricNames.map((name) => ({ value: merged[name] })),
      },
    ],
  };
}

export function createDimensionReportResponse(
  dimensionNames: string[],
  metricNames: string[],
  rows: Array<{ dimensions: string[]; metrics: string[] }>,
): Record<string, unknown> {
  return {
    dimensionHeaders: dimensionNames.map((name) => ({ name })),
    metricHeaders: metricNames.map((name) => ({ name })),
    rows: rows.map((row) => ({
      dimensionValues: row.dimensions.map((value) => ({ value })),
      metricValues: row.metrics.map((value) => ({ value })),
    })),
  };
}

type MockFetchOptions = {
  reportStatus?: number | ((callIndex: number) => number);
  reportError?: { message: string };
  oauthStatus?: number;
  oauthBody?: string;
  unauthorizedOnce?: boolean;
};

/** Mocks OAuth and GA4 Data API fetch calls for provider tests. */
export function createGA4FetchMock(options: MockFetchOptions = {}): ReturnType<typeof vi.fn> {
  let reportCallIndex = 0;
  let sawUnauthorized = false;

  return vi.fn(async (url: string | URL, init?: RequestInit) => {
    const href = String(url);

    if (href.includes("oauth2.googleapis.com/token")) {
      if (options.oauthStatus && options.oauthStatus >= 400) {
        return new Response(options.oauthBody ?? "invalid_grant", {
          status: options.oauthStatus,
        });
      }
      return createOAuthTokenResponse();
    }

    if (href.includes(":runReport")) {
      reportCallIndex += 1;

      if (options.unauthorizedOnce && !sawUnauthorized) {
        sawUnauthorized = true;
        return jsonResponse({ error: { message: "Unauthorized" } }, { status: 401 });
      }

      const status =
        typeof options.reportStatus === "function"
          ? options.reportStatus(reportCallIndex)
          : options.reportStatus;

      if (status === 429) {
        return new Response("rate limited", {
          status: 429,
          headers: { "Retry-After": "0" },
        });
      }

      if (status && status >= 400) {
        return jsonResponse(
          options.reportError ?? { error: { message: "GA4 API error" } },
          { status },
        );
      }

      const body = JSON.parse(String(init?.body ?? "{}")) as {
        dimensions?: Array<{ name: string }>;
      };
      const dimensionName = body.dimensions?.[0]?.name;

      if (dimensionName === "sessionSource") {
        return jsonResponse(
          createDimensionReportResponse(
            ["sessionSource", "sessionMedium"],
            ["sessions", "totalUsers", "conversions"],
            [{ dimensions: ["google", "organic"], metrics: ["500", "400", "10"] }],
          ),
        );
      }

      if (dimensionName === "sessionCampaignName") {
        return jsonResponse(
          createDimensionReportResponse(
            ["sessionCampaignName"],
            ["sessions", "conversions", "purchaseRevenue"],
            [{ dimensions: ["spring-sale"], metrics: ["200", "5", "10000"] }],
          ),
        );
      }

      if (dimensionName === "deviceCategory") {
        return jsonResponse(
          createDimensionReportResponse(
            ["deviceCategory"],
            ["sessions", "totalUsers", "engagementRate"],
            [{ dimensions: ["mobile"], metrics: ["600", "500", "0.6"] }],
          ),
        );
      }

      if (dimensionName === "country") {
        return jsonResponse(
          createDimensionReportResponse(
            ["country", "city"],
            ["sessions", "totalUsers"],
            [{ dimensions: ["India", "Mumbai"], metrics: ["300", "250"] }],
          ),
        );
      }

      if (dimensionName === "landingPagePlusQueryString") {
        return jsonResponse(
          createDimensionReportResponse(
            ["landingPagePlusQueryString"],
            ["sessions", "screenPageViews", "bounceRate"],
            [{ dimensions: ["/home"], metrics: ["150", "300", "0.4"] }],
          ),
        );
      }

      if (dimensionName === "pagePath") {
        return jsonResponse(
          createDimensionReportResponse(
            ["pagePath"],
            ["screenPageViews", "sessions", "bounceRate"],
            [{ dimensions: ["/pricing"], metrics: ["400", "180", "0.35"] }],
          ),
        );
      }

      return jsonResponse(createCoreMetricsReportResponse());
    }

    return new Response("not found", { status: 404 });
  });
}

export function createTestSnapshot(overrides?: Partial<GA4MetricsSnapshot>): GA4MetricsSnapshot {
  return {
    fetchedAt: "2026-07-25T10:00:00.000Z",
    propertyId: testGA4Config.propertyId,
    comparison: {
      periodLabel: "7d",
      current: {
        sessions: 1000,
        users: 800,
        activeUsers: 750,
        newUsers: 200,
        pageViews: 2500,
        screenViews: 2500,
        revenue: 50_000,
        transactions: 25,
        conversions: 100,
        bounceRate: 0.45,
        engagementRate: 0.55,
        averageEngagementTime: 120,
      },
      previous: {
        sessions: 900,
        users: 700,
        activeUsers: 650,
        newUsers: 180,
        pageViews: 2200,
        screenViews: 2200,
        revenue: 45_000,
        transactions: 20,
        conversions: 90,
        bounceRate: 0.5,
        engagementRate: 0.5,
        averageEngagementTime: 110,
      },
    },
    trafficSources: [
      { source: "google", medium: "organic", sessions: 500, users: 400, conversions: 10 },
    ],
    campaigns: [{ campaign: "spring-sale", sessions: 200, conversions: 5, revenue: 10_000 }],
    devices: [{ category: "mobile", sessions: 600, users: 500, engagementRate: 0.6 }],
    geography: [{ country: "India", city: "Mumbai", sessions: 300, users: 250 }],
    landingPages: [{ path: "/home", sessions: 150, pageViews: 300, bounceRate: 0.4 }],
    topPages: [{ path: "/pricing", pageViews: 400, sessions: 180, bounceRate: 0.35 }],
    ...overrides,
  };
}