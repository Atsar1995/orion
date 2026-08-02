/**
 * Platform store health reporting (Mission P-015.4 · ADR-011).
 */

import type { StoreProvider } from "@/lib/platform/store/StoreConfiguration";

export type PlatformStoreHealthStatus = "healthy" | "degraded" | "unhealthy" | "not_initialized";

export type PlatformStoreHealthReport = {
  readonly provider: StoreProvider;
  readonly status: PlatformStoreHealthStatus;
  readonly initialized: boolean;
  readonly message: string;
  readonly migrationReady: boolean;
  readonly checkedAt: string;
  readonly details?: Readonly<Record<string, string>>;
};

export function createPlatformStoreHealthReport(input: {
  provider: StoreProvider;
  status: PlatformStoreHealthStatus;
  initialized: boolean;
  message: string;
  migrationReady: boolean;
  details?: Record<string, string>;
}): PlatformStoreHealthReport {
  return {
    provider: input.provider,
    status: input.status,
    initialized: input.initialized,
    message: input.message,
    migrationReady: input.migrationReady,
    checkedAt: new Date().toISOString(),
    details: input.details ? { ...input.details } : undefined,
  };
}
