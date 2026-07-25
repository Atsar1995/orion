import { GA4Authenticator } from "@/lib/providers/google-analytics/GA4Authenticator";
import { GA4Cache } from "@/lib/providers/google-analytics/GA4Cache";
import type {
  GA4CampaignPerformance,
  GA4Config,
  GA4CoreMetrics,
  GA4DeviceCategory,
  GA4GeographicData,
  GA4MetricsSnapshot,
  GA4PagePerformance,
  GA4PeriodComparison,
  GA4ReportRow,
  GA4RunReportResponse,
  GA4TrafficSource,
} from "@/types/google-analytics";

const GA4_DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";

type RawReportResponse = {
  dimensionHeaders?: Array<{ name: string }>;
  metricHeaders?: Array<{ name: string; type?: string }>;
  rows?: Array<{
    dimensionValues?: Array<{ value: string }>;
    metricValues?: Array<{ value: string }>;
  }>;
  rowCount?: number;
  error?: { message?: string; code?: number; status?: string };
};

type RunReportRequest = {
  dateRanges: Array<{ startDate: string; endDate: string; name?: string }>;
  metrics: Array<{ name: string }>;
  dimensions?: Array<{ name: string }>;
  limit?: number;
  orderBys?: Array<{ metric?: { metricName: string }; desc?: boolean }>;
};

function log(level: "info" | "warn" | "error", message: string, context?: Record<string, unknown>): void {
  const suffix = context ? ` ${JSON.stringify(context)}` : "";
  const line = `[GoogleAnalyticsProvider] ${message}${suffix}`;

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

function parseNumber(value: string | undefined): number {
  if (!value || value === "(not set)") {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function emptyCoreMetrics(): GA4CoreMetrics {
  return {
    sessions: 0,
    users: 0,
    activeUsers: 0,
    newUsers: 0,
    pageViews: 0,
    screenViews: 0,
    revenue: 0,
    transactions: 0,
    conversions: 0,
    bounceRate: 0,
    engagementRate: 0,
    averageEngagementTime: 0,
  };
}

function parseCoreMetrics(rows: GA4ReportRow[]): GA4CoreMetrics {
  const row = rows[0];

  if (!row) {
    return emptyCoreMetrics();
  }

  const metricMap = new Map(row.metrics.map((metric) => [metric.name, metric.value]));

  return {
    sessions: metricMap.get("sessions") ?? 0,
    users: metricMap.get("totalUsers") ?? 0,
    activeUsers: metricMap.get("activeUsers") ?? 0,
    newUsers: metricMap.get("newUsers") ?? 0,
    pageViews: metricMap.get("screenPageViews") ?? 0,
    screenViews: metricMap.get("screenPageViews") ?? 0,
    revenue: metricMap.get("purchaseRevenue") ?? 0,
    transactions: metricMap.get("transactions") ?? 0,
    conversions: metricMap.get("conversions") ?? 0,
    bounceRate: metricMap.get("bounceRate") ?? 0,
    engagementRate: metricMap.get("engagementRate") ?? 0,
    averageEngagementTime: metricMap.get("averageSessionDuration") ?? 0,
  };
}

/** GA4 Data API client with OAuth2, retry, rate-limit handling, and caching. */
export class GA4Client {
  private readonly authenticator: GA4Authenticator;
  private readonly cache: GA4Cache;

  constructor(private readonly config: GA4Config) {
    this.authenticator = new GA4Authenticator(config);
    this.cache = new GA4Cache(config.cacheTtlMs);
  }

  getCache(): GA4Cache {
    return this.cache;
  }

  async fetchMetricsSnapshot(forceRefresh = false): Promise<GA4MetricsSnapshot> {
    const cacheKey = this.cache.snapshotKey(this.config.propertyId);

    if (!forceRefresh) {
      const cached = this.cache.getSnapshot(this.config.propertyId);
      if (cached) {
        log("info", "Returning cached GA4 snapshot", { propertyId: this.config.propertyId });
        return cached;
      }
    } else {
      this.cache.invalidate(cacheKey);
    }

    log("info", "Fetching GA4 metrics snapshot", { propertyId: this.config.propertyId });

    const [comparison, trafficSources, campaigns, devices, geography, landingPages, topPages] =
      await Promise.all([
        this.fetchPeriodComparison(),
        this.fetchTrafficSources(),
        this.fetchCampaignPerformance(),
        this.fetchDeviceCategories(),
        this.fetchGeographicData(),
        this.fetchLandingPages(),
        this.fetchTopPages(),
      ]);

    const snapshot: GA4MetricsSnapshot = {
      fetchedAt: new Date().toISOString(),
      propertyId: this.config.propertyId,
      comparison,
      trafficSources,
      campaigns,
      devices,
      geography,
      landingPages,
      topPages,
    };

    this.cache.setSnapshot(this.config.propertyId, snapshot);
    return snapshot;
  }

  async probePropertyAccess(): Promise<boolean> {
    try {
      await this.runReport({
        dateRanges: [{ startDate: "yesterday", endDate: "today" }],
        metrics: [{ name: "sessions" }],
        limit: 1,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async fetchPeriodComparison(): Promise<GA4PeriodComparison> {
    const metrics = [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "activeUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "purchaseRevenue" },
      { name: "transactions" },
      { name: "conversions" },
      { name: "bounceRate" },
      { name: "engagementRate" },
      { name: "averageSessionDuration" },
    ];

    const [currentResponse, previousResponse] = await Promise.all([
      this.runReport({
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics,
      }),
      this.runReport({
        dateRanges: [{ startDate: "14daysAgo", endDate: "8daysAgo" }],
        metrics,
      }),
    ]);

    return {
      periodLabel: "7d",
      current: parseCoreMetrics(currentResponse.rows),
      previous: parseCoreMetrics(previousResponse.rows),
    };
  }

  private async fetchTrafficSources(): Promise<GA4TrafficSource[]> {
    const response = await this.runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "conversions" }],
      limit: 10,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    return response.rows.map((row) => ({
      source: row.dimensions[0]?.value ?? "(not set)",
      medium: row.dimensions[1]?.value ?? "(not set)",
      sessions: row.metrics[0]?.value ?? 0,
      users: row.metrics[1]?.value ?? 0,
      conversions: row.metrics[2]?.value ?? 0,
    }));
  }

  private async fetchCampaignPerformance(): Promise<GA4CampaignPerformance[]> {
    const response = await this.runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }, { name: "purchaseRevenue" }],
      limit: 10,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    return response.rows.map((row) => ({
      campaign: row.dimensions[0]?.value ?? "(not set)",
      sessions: row.metrics[0]?.value ?? 0,
      conversions: row.metrics[1]?.value ?? 0,
      revenue: row.metrics[2]?.value ?? 0,
    }));
  }

  private async fetchDeviceCategories(): Promise<GA4DeviceCategory[]> {
    const response = await this.runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "engagementRate" }],
      limit: 5,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    return response.rows.map((row) => ({
      category: row.dimensions[0]?.value ?? "(not set)",
      sessions: row.metrics[0]?.value ?? 0,
      users: row.metrics[1]?.value ?? 0,
      engagementRate: row.metrics[2]?.value ?? 0,
    }));
  }

  private async fetchGeographicData(): Promise<GA4GeographicData[]> {
    const response = await this.runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "country" }, { name: "city" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      limit: 10,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    return response.rows.map((row) => ({
      country: row.dimensions[0]?.value ?? "(not set)",
      city: row.dimensions[1]?.value,
      sessions: row.metrics[0]?.value ?? 0,
      users: row.metrics[1]?.value ?? 0,
    }));
  }

  private async fetchLandingPages(): Promise<GA4PagePerformance[]> {
    const response = await this.runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "bounceRate" }],
      limit: 10,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    return response.rows.map((row) => ({
      path: row.dimensions[0]?.value ?? "(not set)",
      sessions: row.metrics[0]?.value ?? 0,
      pageViews: row.metrics[1]?.value ?? 0,
      bounceRate: row.metrics[2]?.value ?? 0,
    }));
  }

  private async fetchTopPages(): Promise<GA4PagePerformance[]> {
    const response = await this.runReport({
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "bounceRate" }],
      limit: 10,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    });

    return response.rows.map((row) => ({
      path: row.dimensions[0]?.value ?? "(not set)",
      pageViews: row.metrics[0]?.value ?? 0,
      sessions: row.metrics[1]?.value ?? 0,
      bounceRate: row.metrics[2]?.value ?? 0,
    }));
  }

  private async runReport(request: RunReportRequest): Promise<GA4RunReportResponse> {
    const url = `${GA4_DATA_API_BASE}/properties/${this.config.propertyId}:runReport`;
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt <= this.config.maxRetries) {
      attempt += 1;

      try {
        const accessToken = await this.authenticator.getAccessToken();
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: AbortSignal.timeout(this.config.requestTimeoutMs),
        });

        if (response.status === 401) {
          this.authenticator.invalidateToken();
          throw new Error("GA4 access token expired");
        }

        if (response.status === 429 || response.status >= 500) {
          const retryAfter = Number.parseInt(response.headers.get("Retry-After") ?? "0", 10);
          const delayMs = retryAfter > 0 ? retryAfter * 1000 : Math.min(1000 * 2 ** attempt, 8000);
          log("warn", "GA4 rate limit or server error — retrying", {
            status: response.status,
            attempt,
            delayMs,
          });
          await sleep(delayMs);
          continue;
        }

        const payload = (await response.json()) as RawReportResponse;

        if (!response.ok) {
          const message = payload.error?.message ?? `GA4 runReport failed (${response.status})`;
          throw new Error(message);
        }

        return normalizeReportResponse(payload);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt > this.config.maxRetries) {
          break;
        }

        log("warn", "GA4 request failed — retrying", {
          attempt,
          error: lastError.message,
        });
        await sleep(Math.min(1000 * 2 ** attempt, 8000));
      }
    }

    throw lastError ?? new Error("GA4 runReport failed after retries");
  }
}

function normalizeReportResponse(payload: RawReportResponse): GA4RunReportResponse {
  const dimensionHeaders = payload.dimensionHeaders?.map((header) => header.name) ?? [];
  const metricHeaders = payload.metricHeaders?.map((header) => header.name) ?? [];

  const rows: GA4ReportRow[] =
    payload.rows?.map((row) => ({
      dimensions: (row.dimensionValues ?? []).map((value, index) => ({
        name: dimensionHeaders[index] ?? `dimension_${index}`,
        value: value.value,
      })),
      metrics: (row.metricValues ?? []).map((value, index) => ({
        name: metricHeaders[index] ?? `metric_${index}`,
        value: parseNumber(value.value),
      })),
    })) ?? [];

  return {
    dimensionHeaders,
    metricHeaders,
    rows,
    rowCount: payload.rowCount ?? rows.length,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
