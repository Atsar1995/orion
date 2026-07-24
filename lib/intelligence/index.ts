export type { ExecutiveProvider } from "@/lib/intelligence/provider";
export * from "@/lib/intelligence/models";
export {
  register,
  unregister,
  getProvider,
  getProviders,
  discover,
  aggregate,
  aggregateHealth,
  aggregateRecommendations,
  aggregateSummaries,
  prepareBrief,
  getRegistrations,
  getAggregatedBriefingLine,
  getPlatformExecutiveBrief,
  getProviderCardSnapshot,
  getProviderBriefingLine,
  registerProvider,
  unregisterProvider,
  discoverProviders,
  aggregateProviderIntelligence,
} from "@/lib/intelligence/provider-registry";
export type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";
export * from "@/lib/intelligence/constants";
export {
  IntelligencePlatformError,
  ProviderAlreadyRegisteredError,
  ProviderNotFoundError,
  InvalidProviderError,
  VersionMismatchError,
  RegistrationFailedError,
} from "@/lib/intelligence/errors";
