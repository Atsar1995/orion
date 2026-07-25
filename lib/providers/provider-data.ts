import { providerManager } from "@/lib/providers/ProviderManager";
import type {
  DashboardDataProvider,
  ProviderDashboardContribution,
} from "@/types/providers";

function isDashboardDataProvider(provider: unknown): provider is DashboardDataProvider {
  return (
    typeof provider === "object" &&
    provider !== null &&
    "fetchDashboardContribution" in provider &&
    typeof (provider as DashboardDataProvider).fetchDashboardContribution === "function"
  );
}

export type FetchProviderContributionsOptions = {
  /** Skip connect when pipeline stage 1 already connected providers. */
  skipConnect?: boolean;
};

/** Collects dashboard contributions from all registered data providers. */
export async function fetchProviderContributions(
  options: FetchProviderContributionsOptions = {},
): Promise<ProviderDashboardContribution[]> {
  if (!options.skipConnect) {
    await providerManager.connectAll();
  }

  const providers = providerManager
    .getAllProviders()
    .filter(isDashboardDataProvider);

  const results = await Promise.all(
    providers.map((provider) => provider.fetchDashboardContribution()),
  );

  return results
    .filter((result) => result.success && result.data)
    .map((result) => result.data as ProviderDashboardContribution);
}
