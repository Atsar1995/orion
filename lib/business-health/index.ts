export { BusinessHealthEngine } from "@/lib/business-health/engine/BusinessHealthEngine";
export type {
  BusinessHealthEngineError,
  BusinessHealthEngineOptions,
  BusinessHealthEngineResult,
  ProviderCalculationInput,
} from "@/lib/business-health/engine/BusinessHealthEngine";
export type {
  CategoryScoreResult,
  OverallScoreResult,
  ScoringStrategy,
} from "@/lib/business-health/interfaces/ScoringStrategy";
export type {
  Category,
  CategoryDefinition,
  CategoryScore,
  HealthScore,
  HealthStatusLabel,
  HealthStatusThresholds,
  KPI,
  KPICategoryId,
  KPIInput,
  KPISource,
  KPIStatus,
  KPITrend,
  ScoreBreakdown,
} from "@/lib/business-health/models";
export { DEFAULT_HEALTH_STATUS_THRESHOLDS } from "@/lib/business-health/models";
export {
  GA4Normalizer,
  MetaNormalizer,
  ShopifyNormalizer,
  buildNormalizedKPI,
  type GA4RawSignals,
  type KPISignalNormalizer,
  type MetaRawSignals,
  type NormalizationError,
  type NormalizationResult,
  type ShopifyRawSignals,
} from "@/lib/business-health/normalizers";
export { KPIRegistry } from "@/lib/business-health/registry/KPIRegistry";
export {
  CustomerScorer,
  MarketingScorer,
  OperationsScorer,
  RevenueScorer,
  createDefaultCategoryScorers,
  type CategoryScorer,
} from "@/lib/business-health/scorers";
export {
  defaultHealthScoreService,
  HealthScoreService,
} from "@/lib/business-health/services/HealthScoreService";
export { WeightedAverageStrategy } from "@/lib/business-health/strategies/WeightedAverageStrategy";
export {
  buildHealthSummary,
  deriveHealthStatusLabel,
  deriveKPIStatus,
  evaluateKPIScore,
  finalizeKPI,
} from "@/lib/business-health/utils/HealthUtils";
export {
  aggregateConfidence,
  clampScore,
  isValidWeight,
  normalizeWeights,
  weightedAverage,
} from "@/lib/business-health/utils/WeightCalculator";
export {
  calculatePercentChange,
  calculateTrend,
} from "@/lib/business-health/utils/TrendCalculator";
