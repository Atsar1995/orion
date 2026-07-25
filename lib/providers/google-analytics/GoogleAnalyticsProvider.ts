import { BaseProvider } from "@/lib/providers/BaseProvider";
import { GA4Client } from "@/lib/providers/google-analytics/GA4Client";
import { describeGA4Config, loadGA4Config } from "@/lib/providers/google-analytics/GA4Config";
import { runGA4HealthCheck } from "@/lib/providers/google-analytics/GA4Health";
import { mapGA4SnapshotToContribution } from "@/lib/providers/google-analytics/GA4Mapper";
import {
  createErrorResult,
  createProviderHealth,
  createSuccessResult,
} from "@/lib/providers/ProviderHealth";
import type {
  DashboardDataProvider,
  ProviderCapability,
  ProviderConfig,
  ProviderConnection,
  ProviderDashboardContribution,
  ProviderHealth,
  ProviderResult,
} from "@/types/providers";
import type { GA4Config, GA4MetricsSnapshot } from "@/types/google-analytics";

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

/** Production GA4 integration provider — reference implementation for ORION providers (ES-060). */
export class GoogleAnalyticsProvider extends BaseProvider implements DashboardDataProvider {
  readonly id = "google-analytics";
  readonly name = "Google Analytics 4";

  private readonly ga4Config: GA4Config;
  private readonly client: GA4Client;
  private snapshot: GA4MetricsSnapshot | null = null;
  private lastError: string | undefined;

  constructor(config?: GA4Config) {
    const ga4Config = config ?? loadGA4Config();

    super({
      id: "google-analytics",
      name: "Google Analytics 4",
      enabled: true,
      mock: false,
      workspace: "Marketing",
    } satisfies ProviderConfig);

    this.ga4Config = ga4Config;
    this.client = new GA4Client(ga4Config);
  }

  getCapabilities(): ProviderCapability[] {
    return ["metrics", "alerts", "recommendations", "trends", "health", "brief"];
  }

  async connect(): Promise<ProviderResult<ProviderConnection>> {
    try {
      log("info", "Connecting to GA4", { config: describeGA4Config(this.ga4Config) });

      const health = await runGA4HealthCheck(this.ga4Config, this.client);

      if (!health.healthy) {
        this.health = createProviderHealth("error", false, health.message);
        return createErrorResult(this.id, health.message);
      }

      this.connection = {
        connected: true,
        connectedAt: new Date().toISOString(),
      };
      this.health = createProviderHealth("connected", true, health.message);
      this.lastError = undefined;

      return createSuccessResult(this.id, this.connection);
    } catch (error) {
      const message = error instanceof Error ? error.message : "GA4 connect failed";
      this.health = createProviderHealth("error", false, message);
      this.lastError = message;
      log("error", "Connect failed", { error: message });
      return createErrorResult(this.id, message);
    }
  }

  async disconnect(): Promise<ProviderResult<void>> {
    this.client.getCache().invalidate();
    this.snapshot = null;
    return super.disconnect();
  }

  async healthCheck(): Promise<ProviderResult<ProviderHealth>> {
    if (!this.connection.connected) {
      const health = createProviderHealth("disconnected", false, "Provider not connected");
      this.health = health;
      return createSuccessResult(this.id, health);
    }

    try {
      const ga4Health = await runGA4HealthCheck(this.ga4Config, this.client);
      this.health = createProviderHealth(
        ga4Health.healthy ? "connected" : "error",
        ga4Health.healthy,
        ga4Health.message,
      );
      return createSuccessResult(this.id, this.health);
    } catch (error) {
      const message = error instanceof Error ? error.message : "GA4 health check failed";
      this.health = createProviderHealth("error", false, message);
      return createSuccessResult(this.id, this.health);
    }
  }

  async sync(): Promise<ProviderResult<void>> {
    if (!this.connection.connected) {
      const connectResult = await this.connect();
      if (!connectResult.success) {
        return createErrorResult(this.id, connectResult.error ?? "Connect failed before sync");
      }
    }

    try {
      this.health = createProviderHealth("syncing", true, "Syncing GA4 metrics");
      this.snapshot = await this.client.fetchMetricsSnapshot(true);
      this.connection.lastSyncAt = new Date().toISOString();
      this.health = createProviderHealth(
        "connected",
        true,
        `GA4 synced at ${this.connection.lastSyncAt}`,
      );
      this.lastError = undefined;

      log("info", "Sync completed", {
        propertyId: this.ga4Config.propertyId,
        fetchedAt: this.snapshot.fetchedAt,
      });

      return createSuccessResult(this.id, undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "GA4 sync failed";
      this.lastError = message;
      this.health = createProviderHealth("error", false, message);
      log("error", "Sync failed", { error: message });
      return createErrorResult(this.id, message);
    }
  }

  async refresh(): Promise<ProviderResult<void>> {
    return this.sync();
  }

  async fetchDashboardContribution(): Promise<ProviderResult<ProviderDashboardContribution>> {
    this.ensureConnected();

    try {
      if (!this.snapshot) {
        const syncResult = await this.sync();
        if (!syncResult.success || !this.snapshot) {
          return createErrorResult(
            this.id,
            syncResult.error ?? this.lastError ?? "GA4 snapshot unavailable",
          );
        }
      } else {
        this.snapshot = await this.client.fetchMetricsSnapshot(false);
      }

      const contribution = mapGA4SnapshotToContribution(this.snapshot);
      return createSuccessResult(this.id, contribution);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch GA4 contribution";

      if (this.snapshot) {
        log("warn", "Serving stale GA4 snapshot after fetch failure", { error: message });
        return createSuccessResult(this.id, mapGA4SnapshotToContribution(this.snapshot));
      }

      log("error", "Dashboard contribution failed", { error: message });
      return createErrorResult(this.id, message);
    }
  }
}

/** Creates a GA4 provider when configuration is valid; returns undefined otherwise. */
export function createGoogleAnalyticsProvider(): GoogleAnalyticsProvider | undefined {
  try {
    return new GoogleAnalyticsProvider();
  } catch {
    return undefined;
  }
}
