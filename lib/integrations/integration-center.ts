import {
  formatPluginPermissions,
  resolveCredentialStatus,
  resolvePluginCategory,
  resolveProviderMetadata,
} from "@/lib/integrations/integration-metadata";
import { integrationHistoryStore } from "@/lib/integrations/sync-history";
import type {
  IntegrationCategory,
  IntegrationCenterDashboard,
  IntegrationCenterSnapshot,
  IntegrationProviderRecord,
} from "@/lib/integrations/types";
import { INTEGRATION_CATEGORIES } from "@/lib/integrations/types";
import { pluginMarketplace } from "@/lib/plugins/PluginMarketplace";
import { executionLogger } from "@/lib/orchestrator/ExecutionLogger";
import { BaseProvider } from "@/lib/providers/BaseProvider";
import { providerManager } from "@/lib/providers/ProviderManager";
import type { Provider } from "@/types/providers";

function isBaseProvider(provider: Provider): provider is BaseProvider {
  return provider instanceof BaseProvider;
}

function estimateOAuthTokenExpiry(providerId: string, authType: string): string | undefined {
  if (authType !== "oauth2" || providerId !== "google-analytics") {
    return undefined;
  }

  if (resolveCredentialStatus(providerId, "oauth2") !== "configured") {
    return undefined;
  }

  return new Date(Date.now() + 55 * 60 * 1000).toISOString();
}

function mapProviderRecord(
  provider: Provider,
  healthLookup: Map<string, { health: IntegrationProviderRecord["health"] }>,
): IntegrationProviderRecord {
  const metadata = resolveProviderMetadata(provider.id, provider.config.mock);
  const healthEntry = healthLookup.get(provider.id);
  const connection = isBaseProvider(provider) ? provider.getConnectionState() : undefined;
  const cachedHealth = isBaseProvider(provider) ? provider.getHealthState() : undefined;
  const health = healthEntry?.health ?? cachedHealth ?? {
    status: "disconnected" as const,
    healthy: false,
    lastCheckedAt: new Date().toISOString(),
    message: "Health not yet checked",
  };

  const credentialStatus = resolveCredentialStatus(provider.id, metadata.authType);
  const tokenExpiresAt = estimateOAuthTokenExpiry(provider.id, metadata.authType);

  return {
    id: provider.id,
    name: provider.name,
    version: metadata.version,
    status: health.status,
    health,
    lastSync: connection?.lastSyncAt,
    connectedAt: connection?.connectedAt,
    capabilities: provider.getCapabilities(),
    authType: metadata.authType,
    permissions: metadata.permissions,
    providerType: metadata.providerType,
    category: metadata.category,
    enabled: provider.config.enabled,
    workspace: provider.config.workspace,
    credentialStatus:
      tokenExpiresAt && new Date(tokenExpiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
        ? "expiring"
        : credentialStatus,
    tokenExpiresAt,
  };
}

function mapPluginProviders(): IntegrationProviderRecord[] {
  const catalog = pluginMarketplace.getCatalog();
  const installedIds = new Set(catalog.installed.map((entry) => entry.plugin.manifest.metadata.id));

  return catalog.available
    .filter((listing) => !installedIds.has(listing.manifest.metadata.id))
    .map((listing) => {
      const { metadata, permissions } = listing.manifest;

      return {
        id: metadata.id,
        name: metadata.name,
        version: metadata.version,
        status: "disconnected" as const,
        health: {
          status: "disconnected" as const,
          healthy: false,
          lastCheckedAt: new Date().toISOString(),
          message: "Plugin available — not installed",
        },
        capabilities: [],
        authType: "manual" as const,
        permissions: formatPluginPermissions(permissions.map((permission) => permission.scope)),
        providerType: "plugin" as const,
        category: resolvePluginCategory(metadata.category),
        enabled: false,
        credentialStatus: "not-required" as const,
      };
    });
}

function buildDashboard(
  providers: IntegrationProviderRecord[],
  syncHistory: IntegrationCenterSnapshot["syncHistory"],
): IntegrationCenterDashboard {
  const connectedProviders = providers.filter(
    (provider) => provider.providerType !== "plugin" && provider.health.status === "connected",
  ).length;

  const disconnectedProviders = providers.filter(
    (provider) =>
      provider.providerType !== "plugin" &&
      (provider.health.status === "disconnected" || !provider.health.healthy),
  ).length;

  const healthyProviders = providers.filter(
    (provider) => provider.providerType !== "plugin" && provider.health.healthy,
  ).length;

  const unhealthyProviders = providers.filter(
    (provider) => provider.providerType !== "plugin" && !provider.health.healthy,
  ).length;

  return {
    connectedProviders,
    disconnectedProviders,
    healthyProviders,
    unhealthyProviders,
    failedConnections: integrationHistoryStore.countFailedConnections(),
    upcomingTokenExpirations: providers.filter(
      (provider) => provider.credentialStatus === "expiring",
    ).length,
    recentSyncActivity: syncHistory.slice(0, 5),
  };
}

/** Builds the Integration Center snapshot from Provider Registry, Plugin Framework, and Orchestrator logs. */
export async function getIntegrationCenterSnapshot(): Promise<IntegrationCenterSnapshot> {
  const registeredProviders = providerManager.getAllProviders();
  const healthReport = await providerManager.healthReport();
  const healthLookup = new Map(
    healthReport.providers.map((entry) => [entry.id, { health: entry.health }]),
  );

  const providers = [
    ...registeredProviders.map((provider) => mapProviderRecord(provider, healthLookup)),
    ...mapPluginProviders(),
  ];

  const orchestratorLogs = executionLogger.getRecent(10).map((entry, index) => ({
    id: `orchestrator-log-${index}`,
    providerId: "orchestrator",
    level: entry.level,
    message: entry.message,
    timestamp: entry.timestamp,
  }));

  const syncHistory = integrationHistoryStore.getSyncHistory(undefined, 20);
  const logs = [...integrationHistoryStore.getLogs(undefined, 20), ...orchestratorLogs].slice(0, 20);

  return {
    generatedAt: new Date().toISOString(),
    dashboard: buildDashboard(providers, syncHistory),
    providers,
    categories: INTEGRATION_CATEGORIES.map((category) => category.id),
    syncHistory,
    logs,
  };
}

export function filterIntegrationProviders(
  providers: IntegrationProviderRecord[],
  options: {
    category?: IntegrationCategory | "all";
    query?: string;
    status?: "all" | "connected" | "disconnected" | "error";
  },
): IntegrationProviderRecord[] {
  const query = options.query?.trim().toLowerCase() ?? "";

  return providers.filter((provider) => {
    if (options.category && options.category !== "all" && provider.category !== options.category) {
      return false;
    }

    if (options.status && options.status !== "all") {
      if (options.status === "connected" && provider.health.status !== "connected") {
        return false;
      }

      if (options.status === "disconnected" && provider.health.status !== "disconnected") {
        return false;
      }

      if (options.status === "error" && provider.health.status !== "error") {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    return (
      provider.name.toLowerCase().includes(query) ||
      provider.id.toLowerCase().includes(query) ||
      provider.workspace?.toLowerCase().includes(query)
    );
  });
}

export function groupProvidersByCategory(
  providers: IntegrationProviderRecord[],
): Partial<Record<IntegrationCategory, IntegrationProviderRecord[]>> {
  return providers.reduce<Partial<Record<IntegrationCategory, IntegrationProviderRecord[]>>>(
    (groups, provider) => {
      const existing = groups[provider.category] ?? [];
      existing.push(provider);
      groups[provider.category] = existing;
      return groups;
    },
    {},
  );
}
