import {
  aggregate,
  getAggregatedBriefingLine,
  getPlatformExecutiveBrief,
  getProvider,
  getProviderBriefingLine,
  getProviderCardSnapshot,
  getProviders,
} from "@/lib/intelligence/provider-registry";
import type { PlatformSnapshot } from "@/lib/intelligence/models";
import type { ExecutiveBriefOutput } from "@/lib/intelligence/engine-models";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";

/** Side-effect: registers Finance and CRM executive providers. */
import "@/lib/intelligence/register-executive-providers";

/**
 * Executive Intelligence Bus (ADR-006)
 *
 * Coordinates provider discovery, engine aggregation, and Executive Brief generation.
 * Executive Shell and Advisor components consume this bus — never individual workspaces.
 */

/** Discovers all registered executive providers. */
export function discoverExecutiveProviders(): RegisteredExecutiveProvider[] {
  return getProviders();
}

/** Aggregates health scores from all providers. */
export function aggregateHealthScores() {
  return aggregate().healthScores;
}

/** Aggregates recommendations from all providers. */
export function aggregateRecommendations() {
  return aggregate().recommendations;
}

/** Aggregates alerts from all providers. */
export function aggregateAlerts() {
  return aggregate().alerts;
}

/** Aggregates priorities from all providers. */
export function aggregatePriorities() {
  return aggregate().priorities;
}

/** Generates the platform Executive Brief from provider registry output. */
export function generateExecutiveBrief(): ExecutiveBriefOutput {
  return getPlatformExecutiveBrief();
}

/** Returns the full platform intelligence snapshot. */
export function getPlatformIntelligenceSnapshot(): PlatformSnapshot {
  return aggregate();
}

export {
  getAggregatedBriefingLine,
  getProvider,
  getProviderBriefingLine,
  getProviderCardSnapshot,
};
