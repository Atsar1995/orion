import { vi, type Mock } from "vitest";
import { createSuccessResult } from "@/lib/providers/ProviderHealth";
import type {
  DashboardDataProvider,
  ProviderCapability,
  ProviderConfig,
  ProviderDashboardContribution,
  ProviderResult,
} from "@/types/providers";

type MockDashboardProviderOptions = {
  id: string;
  name?: string;
  contribution: ProviderDashboardContribution;
  fetchDashboardContribution?: Mock<
    () => Promise<ProviderResult<ProviderDashboardContribution>>
  >;
};

/** Creates a test double that satisfies DashboardDataProvider and Provider. */
export function createMockDashboardProvider(
  options: MockDashboardProviderOptions,
): DashboardDataProvider {
  const config: ProviderConfig = {
    id: options.id,
    name: options.name ?? options.id,
    enabled: true,
    mock: true,
    workspace: options.contribution.workspace,
  };

  const fetchDashboardContribution =
    options.fetchDashboardContribution ??
    vi.fn().mockResolvedValue(createSuccessResult(options.id, options.contribution));

  return {
    id: options.id,
    name: options.name ?? options.id,
    config,
    connect: vi.fn().mockResolvedValue(
      createSuccessResult(options.id, { connected: true, connectedAt: "2026-07-25T10:00:00.000Z" }),
    ),
    disconnect: vi.fn().mockResolvedValue(createSuccessResult(options.id, undefined)),
    healthCheck: vi.fn().mockResolvedValue(
      createSuccessResult(options.id, {
        status: "connected",
        healthy: true,
        lastCheckedAt: "2026-07-25T10:00:00.000Z",
      }),
    ),
    sync: vi.fn().mockResolvedValue(createSuccessResult(options.id, undefined)),
    refresh: vi.fn().mockResolvedValue(createSuccessResult(options.id, undefined)),
    getCapabilities: vi.fn().mockReturnValue(["metrics"] as ProviderCapability[]),
    fetchDashboardContribution,
  };
}

/** Provider mock that returns a failed dashboard contribution result. */
export function createFailingMockDashboardProvider(id: string): DashboardDataProvider {
  return createMockDashboardProvider({
    id,
    contribution: { providerId: id },
    fetchDashboardContribution: vi.fn().mockResolvedValue({
      success: false,
      providerId: id,
      timestamp: "2026-07-25T10:00:00.000Z",
    }),
  });
}
