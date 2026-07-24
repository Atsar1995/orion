import {
  REGISTRY_MAX_PROVIDERS,
  SUPPORTED_PROVIDER_VERSIONS,
} from "@/lib/intelligence/constants";
import {
  InvalidProviderError,
  ProviderAlreadyRegisteredError,
  ProviderNotFoundError,
  RegistrationFailedError,
  VersionMismatchError,
} from "@/lib/intelligence/errors";
import { aggregateWorkspaceSummaries, prepareExecutiveBrief, toExecutiveBriefOutput } from "@/lib/intelligence/brief-engine";
import type {
  ExecutiveBriefOutput,
  PlatformHealthSnapshot,
  RecommendationBundle,
  WorkspaceSummary,
} from "@/lib/intelligence/engine-models";
import { healthEngine } from "@/lib/intelligence/health-engine";
import { recommendationEngine } from "@/lib/intelligence/recommendation-engine";
import { runIntelligencePipeline } from "@/lib/intelligence/pipeline";
import type {
  ExecutivePriority,
  PlatformSnapshot,
  ProviderRegistration,
  RiskIndicator,
} from "@/lib/intelligence/models";
import type { ExecutiveProvider } from "@/lib/intelligence/provider";

/**
 * Registered workspace provider — extends the Mission 17A contract with
 * ADR-006 aggregation methods required by the Intelligence Bus.
 */
export type RegisteredExecutiveProvider = ExecutiveProvider & {
  getRisks(): RiskIndicator[];
  getPriorities(): ExecutivePriority[];
  getBriefingLine(): string;
  getBriefCardSnapshot(): unknown;
};

type RegistryEntry = {
  provider: RegisteredExecutiveProvider;
  registration: ProviderRegistration;
};

const providerRegistry = new Map<string, RegistryEntry>();

function validateProvider(provider: RegisteredExecutiveProvider): void {
  if (!provider.id?.trim()) {
    throw new InvalidProviderError("Provider id is required");
  }

  if (!provider.workspace?.trim()) {
    throw new InvalidProviderError("Provider workspace label is required");
  }

  if (!provider.version?.trim()) {
    throw new InvalidProviderError("Provider version is required");
  }

  if (
    !SUPPORTED_PROVIDER_VERSIONS.includes(
      provider.version as (typeof SUPPORTED_PROVIDER_VERSIONS)[number],
    )
  ) {
    throw new VersionMismatchError(provider.version, SUPPORTED_PROVIDER_VERSIONS);
  }

  const requiredMethods: Array<keyof RegisteredExecutiveProvider> = [
    "getHealth",
    "getAlerts",
    "getRecommendations",
    "getExecutiveSummary",
    "getMetrics",
    "getRisks",
    "getPriorities",
    "getBriefingLine",
    "getBriefCardSnapshot",
  ];

  for (const method of requiredMethods) {
    if (typeof provider[method] !== "function") {
      throw new InvalidProviderError(`Missing method: ${String(method)}`);
    }
  }
}

/** Registers an Executive Intelligence Provider (Mission 17A lifecycle). */
export function register(provider: RegisteredExecutiveProvider): ProviderRegistration {
  validateProvider(provider);

  if (providerRegistry.has(provider.id)) {
    throw new ProviderAlreadyRegisteredError(provider.id);
  }

  if (providerRegistry.size >= REGISTRY_MAX_PROVIDERS) {
    throw new RegistrationFailedError(
      `Registry limit reached (${REGISTRY_MAX_PROVIDERS} providers)`,
    );
  }

  const registration: ProviderRegistration = {
    providerId: provider.id,
    workspace: provider.workspace,
    version: provider.version,
    registeredAt: new Date().toISOString(),
  };

  providerRegistry.set(provider.id, { provider, registration });
  return registration;
}

/** Unregisters a provider by id. */
export function unregister(id: string): void {
  if (!providerRegistry.has(id)) {
    throw new ProviderNotFoundError(id);
  }

  providerRegistry.delete(id);
}

/** Returns a registered provider by id. */
export function getProvider(id: string): RegisteredExecutiveProvider | undefined {
  return providerRegistry.get(id)?.provider;
}

/** Returns all registered providers. */
export function getProviders(): RegisteredExecutiveProvider[] {
  return Array.from(providerRegistry.values()).map((entry) => entry.provider);
}

/** Discovers all registered providers (alias for getProviders). */
export function discover(): RegisteredExecutiveProvider[] {
  return getProviders();
}

/** Returns all provider registration records. */
export function getRegistrations(): ProviderRegistration[] {
  return Array.from(providerRegistry.values()).map((entry) => entry.registration);
}

/** Delegates health aggregation to the Health Engine. */
export function aggregateHealth(): PlatformHealthSnapshot {
  return healthEngine.aggregate(getProviders());
}

/** Delegates recommendation aggregation to the Recommendation Engine. */
export function aggregateRecommendations(): RecommendationBundle {
  return recommendationEngine.aggregate(getProviders());
}

/** Delegates workspace summary aggregation to the Brief Engine helpers. */
export function aggregateSummaries(): WorkspaceSummary[] {
  return aggregateWorkspaceSummaries(getProviders());
}

/** Delegates brief preparation to the Brief Engine. */
export function prepareBrief(): ExecutiveBriefOutput {
  const providers = getProviders();
  const health = healthEngine.aggregate(providers);
  const recommendations = recommendationEngine.aggregate(providers);
  const summaries = aggregateWorkspaceSummaries(providers);

  return toExecutiveBriefOutput(
    prepareExecutiveBrief(providers, health, recommendations, summaries),
  );
}

/** Aggregates intelligence from all registered providers via engines. */
export function aggregate(): PlatformSnapshot {
  const providers = getProviders();
  const pipeline = runIntelligencePipeline(providers);

  return {
    providerCount: providers.length,
    healthScores: pipeline.health.workspaceHealth.map((entry) => entry.health),
    alerts: pipeline.recommendations.criticalAlerts,
    recommendations: pipeline.recommendations.recommendations,
    priorities: pipeline.recommendations.priorities,
    risks: providers.flatMap((provider) => provider.getRisks()),
    briefingLine: pipeline.brief.briefingLine,
    workspaceSnapshots: providers.map((provider) => {
      const health = provider.getHealth();

      return {
        workspaceId: provider.id,
        workspaceLabel: provider.workspace,
        healthScore: health.score,
        trend: health.trend,
        status: health.status,
        briefingLine: provider.getBriefingLine(),
        cardData: provider.getBriefCardSnapshot(),
      };
    }),
  };
}

/** Returns aggregated briefing lines from all providers. */
export function getAggregatedBriefingLine(): string {
  return aggregate().briefingLine;
}

/** Returns the platform Executive Brief output from all providers. */
export function getPlatformExecutiveBrief(): ExecutiveBriefOutput {
  return prepareBrief();
}

/** Returns a provider's Executive Brief card snapshot by id. */
export function getProviderCardSnapshot<T = unknown>(id: string): T | undefined {
  return getProvider(id)?.getBriefCardSnapshot() as T | undefined;
}

/** Returns a provider's briefing line by id. */
export function getProviderBriefingLine(id: string): string {
  return getProvider(id)?.getBriefingLine() ?? "";
}

/** @deprecated Use register() */
export const registerProvider = register;

/** @deprecated Use unregister() */
export const unregisterProvider = unregister;

/** @deprecated Use discover() */
export const discoverProviders = discover;

/** @deprecated Use aggregate() */
export const aggregateProviderIntelligence = aggregate;
