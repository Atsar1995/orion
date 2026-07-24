import { aggregateWorkspaceSummaries, briefEngine } from "@/lib/intelligence/brief-engine";
import type { AggregationResult } from "@/lib/intelligence/engine-models";
import type { PipelineEngine } from "@/lib/intelligence/engine-interfaces";
import { healthEngine } from "@/lib/intelligence/health-engine";
import { recommendationEngine } from "@/lib/intelligence/recommendation-engine";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";

function measureMs<T>(fn: () => T): [T, number] {
  const start = performance.now();
  const result = fn();
  return [result, Math.round(performance.now() - start)];
}

/**
 * Platform Intelligence Pipeline (Mission 17B)
 *
 * Executive Providers → Registry → Health Engine →
 * Recommendation Engine → Brief Engine → Executive Shell
 *
 * Orchestrates engines only — no business calculations.
 */
export function runIntelligencePipeline(
  providers: RegisteredExecutiveProvider[],
): AggregationResult {
  const [health, healthEngineMs] = measureMs(() => healthEngine.aggregate(providers));
  const [recommendations, recommendationEngineMs] = measureMs(() =>
    recommendationEngine.aggregate(providers),
  );
  const [summaries, summaryEngineMs] = measureMs(() =>
    aggregateWorkspaceSummaries(providers),
  );
  const [brief, briefEngineMs] = measureMs(() =>
    briefEngine.prepare(providers, health, recommendations, summaries),
  );

  const totalMs =
    healthEngineMs + recommendationEngineMs + summaryEngineMs + briefEngineMs;

  return {
    health,
    recommendations,
    summaries,
    brief,
    statistics: {
      healthEngineMs,
      recommendationEngineMs,
      briefEngineMs,
      summaryEngineMs,
      totalMs,
      providerCount: providers.length,
    },
  };
}

/** Default Pipeline Engine implementation (Mission 17B). */
export const pipelineEngine: PipelineEngine = {
  run: runIntelligencePipeline,
};
