import type {
  AggregationResult,
  ExecutiveBriefSnapshot,
  PlatformHealthSnapshot,
  RecommendationBundle,
  WorkspaceSummary,
} from "@/lib/intelligence/engine-models";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";

/** Health Engine contract — aggregates provider health (Mission 17B). */
export interface HealthEngine {
  aggregate(providers: RegisteredExecutiveProvider[]): PlatformHealthSnapshot;
}

/** Recommendation Engine contract — aggregates provider recommendations (Mission 17B). */
export interface RecommendationEngine {
  aggregate(providers: RegisteredExecutiveProvider[]): RecommendationBundle;
}

/** Brief Engine contract — produces executive brief snapshot (Mission 17B). */
export interface BriefEngine {
  prepare(
    providers: RegisteredExecutiveProvider[],
    health: PlatformHealthSnapshot,
    recommendations: RecommendationBundle,
    summaries: WorkspaceSummary[],
  ): ExecutiveBriefSnapshot;
}

/** Pipeline Engine contract — orchestrates intelligence engines (Mission 17B). */
export interface PipelineEngine {
  run(providers: RegisteredExecutiveProvider[]): AggregationResult;
}
