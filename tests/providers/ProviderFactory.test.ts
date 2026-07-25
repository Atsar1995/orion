import { afterEach, describe, expect, it, vi } from "vitest";
import { MarketingProvider } from "@/lib/providers/MockProvider";
import {
  createDefaultProviders,
  createMarketingDataProvider,
  GoogleAnalyticsProvider,
  isGoogleAnalyticsConfigured,
  ProviderFactory,
} from "@/lib/providers/ProviderFactory";
import { ga4EnvVars } from "@/tests/fixtures/ga4";

describe("ProviderFactory GA4 selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the marketing mock when GA4 is not configured", () => {
    const provider = createMarketingDataProvider();

    expect(provider).toBeInstanceOf(MarketingProvider);
    expect(provider.id).toBe("marketing");
  });

  it("uses GA4 when credentials are configured", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }

    const provider = createMarketingDataProvider();

    expect(isGoogleAnalyticsConfigured()).toBe(true);
    expect(provider).toBeInstanceOf(GoogleAnalyticsProvider);
    expect(provider.id).toBe("google-analytics");
  });

  it("includes GA4 or marketing provider in default providers", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }

    const providers = createDefaultProviders();
    const marketingSlot = providers.find(
      (provider) => provider.id === "google-analytics" || provider.id === "marketing",
    );

    expect(marketingSlot?.id).toBe("google-analytics");
  });

  it("creates GA4 provider by id when configured", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }

    const provider = ProviderFactory.createProvider("google-analytics");

    expect(provider?.id).toBe("google-analytics");
  });

  it("returns undefined for google-analytics id when not configured", () => {
    expect(ProviderFactory.createProvider("google-analytics")).toBeUndefined();
  });

  it("routes marketing id through createMarketingDataProvider", () => {
    for (const [key, value] of Object.entries(ga4EnvVars)) {
      vi.stubEnv(key, value);
    }

    const provider = ProviderFactory.createProvider("marketing");

    expect(provider?.id).toBe("google-analytics");
  });

  it("creates known mock providers by id", () => {
    const provider = ProviderFactory.createProvider("crm");

    expect(provider?.id).toBe("crm");
  });

  it("returns mock providers from createMockProviders alias", () => {
    const providers = ProviderFactory.createMockProviders();

    expect(providers.map((provider) => provider.id)).toEqual(
      expect.arrayContaining(["crm", "finance", "hospitality", "commerce", "calendar", "email"]),
    );
  });
});
