import type { Provider, ProviderHealth, ProviderHealthReport } from "@/types/providers";

export function createProviderHealth(
  status: ProviderHealth["status"],
  healthy: boolean,
  message?: string,
): ProviderHealth {
  return {
    status,
    healthy,
    lastCheckedAt: new Date().toISOString(),
    message,
  };
}

export function createSuccessResult<T>(
  providerId: string,
  data: T,
): import("@/types/providers").ProviderResult<T> {
  return {
    success: true,
    data,
    providerId,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResult<T>(
  providerId: string,
  error: string,
): import("@/types/providers").ProviderResult<T> {
  return {
    success: false,
    error,
    providerId,
    timestamp: new Date().toISOString(),
  };
}

export async function buildHealthReport(providers: Provider[]): Promise<ProviderHealthReport> {
  const entries = await Promise.all(
    providers.map(async (provider) => {
      const result = await provider.healthCheck();
      return {
        id: provider.id,
        name: provider.name,
        health: result.data ?? createProviderHealth("error", false, result.error),
      };
    }),
  );

  const healthy = entries.filter((entry) => entry.health.healthy).length;

  return {
    generatedAt: new Date().toISOString(),
    total: entries.length,
    healthy,
    unhealthy: entries.length - healthy,
    providers: entries,
  };
}
