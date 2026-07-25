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

/** Factory for creating ORION integration providers (ES-060). */
export class ProviderFactory {
  static createMockProviders(): Provider[] {
    return [
      new CRMProvider(),
      new FinanceProvider(),
      new MarketingProvider(),
      new HospitalityProvider(),
      new CommerceProvider(),
      new CalendarProvider(),
      new EmailProvider(),
    ];
  }

  static createProvider(id: string): Provider | undefined {
    return ProviderFactory.createMockProviders().find((provider) => provider.id === id);
  }
}

export function createDefaultProviders(): Provider[] {
  return ProviderFactory.createMockProviders();
}
