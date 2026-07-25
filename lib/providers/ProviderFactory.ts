import {
  createGoogleAnalyticsProvider,
  GoogleAnalyticsProvider,
} from "@/lib/providers/google-analytics/GoogleAnalyticsProvider";
import { isGoogleAnalyticsConfigured } from "@/lib/providers/google-analytics/GA4Config";
import {
  CalendarProvider,
  CommerceProvider,
  CRMProvider,
  EmailProvider,
  FinanceProvider,
  HospitalityProvider,
  MarketingProvider,
} from "@/lib/providers/MockProvider";
import type { Provider } from "@/types/providers";

/** Returns GA4 provider when credentials are configured; otherwise the marketing mock. */
export function createMarketingDataProvider(): Provider {
  if (isGoogleAnalyticsConfigured()) {
    const ga4Provider = createGoogleAnalyticsProvider();
    if (ga4Provider) {
      return ga4Provider;
    }
  }

  return new MarketingProvider();
}

/** Factory for creating ORION integration providers (ES-060). */
export class ProviderFactory {
  static createMockProviders(): Provider[] {
    return ProviderFactory.createDefaultProviders();
  }

  static createDefaultProviders(): Provider[] {
    return [
      new CRMProvider(),
      new FinanceProvider(),
      createMarketingDataProvider(),
      new HospitalityProvider(),
      new CommerceProvider(),
      new CalendarProvider(),
      new EmailProvider(),
    ];
  }

  static createProvider(id: string): Provider | undefined {
    if (id === "google-analytics") {
      return isGoogleAnalyticsConfigured() ? createGoogleAnalyticsProvider() : undefined;
    }

    if (id === "marketing") {
      return createMarketingDataProvider();
    }

    return ProviderFactory.createDefaultProviders().find((provider) => provider.id === id);
  }
}

export function createDefaultProviders(): Provider[] {
  return ProviderFactory.createDefaultProviders();
}

export { GoogleAnalyticsProvider, isGoogleAnalyticsConfigured };
