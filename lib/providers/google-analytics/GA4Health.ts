import { GA4Client } from "@/lib/providers/google-analytics/GA4Client";
import type { GA4Config, GA4HealthStatus } from "@/types/google-analytics";

/** Health checks for GA4 authentication and property connectivity. */
export class GA4HealthChecker {
  constructor(
    private readonly config: GA4Config,
    private readonly client: GA4Client,
  ) {}

  async check(): Promise<GA4HealthStatus> {
    const lastCheckedAt = new Date().toISOString();

    try {
      const propertyReachable = await this.client.probePropertyAccess();

      return {
        healthy: propertyReachable,
        authenticated: propertyReachable,
        propertyReachable,
        message: propertyReachable
          ? `GA4 property ${this.config.propertyId} is reachable`
          : `GA4 property ${this.config.propertyId} is not reachable`,
        lastCheckedAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "GA4 health check failed";

      return {
        healthy: false,
        authenticated: false,
        propertyReachable: false,
        message,
        lastCheckedAt,
      };
    }
  }
}

export async function runGA4HealthCheck(
  config: GA4Config,
  client: GA4Client,
): Promise<GA4HealthStatus> {
  return new GA4HealthChecker(config, client).check();
}
