import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import type { KPI } from "@/lib/business-health/models/KPI";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import {
  calculateConfidence,
  type ConfidenceAssessmentInput,
} from "@/lib/explainability/engine/ConfidenceCalculator";
import {
  DEFAULT_CONFIDENCE_RULES,
  type ConfidenceRules,
} from "@/lib/explainability/engine/ConfidenceRules";

/** Optional context for deriving confidence signals from normalized KPI data. */
export type ConfidenceAssessmentContext = {
  readonly referenceTime?: string;
  readonly expectedKpiCount?: number;
  readonly kpis?: readonly KPI[];
  readonly missingProviders?: readonly string[];
  readonly unavailableProviders?: readonly string[];
  readonly incompleteNormalizationCount?: number;
  readonly validationFailureCount?: number;
};

const ESTIMATED_SOURCES = new Set(["manual", "spreadsheet"]);

function parseTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isStaleKpi(timestamp: string, referenceTime: string, staleAfterMs: number): boolean {
  const kpiTime = parseTimestamp(timestamp);
  const reference = parseTimestamp(referenceTime);

  if (kpiTime === 0 || reference === 0) {
    return true;
  }

  return reference - kpiTime > staleAfterMs;
}

function isEstimatedKpi(kpi: KPI): boolean {
  return ESTIMATED_SOURCES.has(kpi.source) || kpi.confidence <= 0;
}

function buildAssessmentInput(
  kpis: readonly KPI[],
  context: ConfidenceAssessmentContext,
  rules: ConfidenceRules,
): ConfidenceAssessmentInput {
  const generatedAt = context.referenceTime ?? new Date().toISOString();
  const expectedKpiCount = context.expectedKpiCount ?? kpis.length;
  const missingKpiCount = Math.max(0, expectedKpiCount - kpis.length);
  const unavailableProviders = context.unavailableProviders ?? context.missingProviders ?? [];

  let staleKpiCount = 0;
  let estimatedValueCount = 0;

  for (const kpi of kpis) {
    if (isStaleKpi(kpi.timestamp, generatedAt, rules.staleAfterMs)) {
      staleKpiCount += 1;
    }

    if (isEstimatedKpi(kpi)) {
      estimatedValueCount += 1;
    }
  }

  return {
    missingKpiCount,
    staleKpiCount,
    unavailableProviderCount: unavailableProviders.length,
    estimatedValueCount,
    incompleteNormalizationCount: context.incompleteNormalizationCount ?? 0,
    validationFailureCount: context.validationFailureCount ?? 0,
    generatedAt,
  };
}

/** Public orchestration layer for deterministic confidence assessments. */
export class ConfidenceEngine {
  private readonly rules: ConfidenceRules;

  constructor(rules: ConfidenceRules = DEFAULT_CONFIDENCE_RULES) {
    this.rules = rules;
  }

  calculate(input: ConfidenceAssessmentInput): Confidence {
    return calculateConfidence(input, this.rules);
  }

  calculateFromKpis(
    kpis: readonly KPI[],
    context: ConfidenceAssessmentContext = {},
  ): Confidence {
    return this.calculate(buildAssessmentInput(kpis, context, this.rules));
  }

  calculateFromHealthScore(
    healthScore: HealthScore,
    context: ConfidenceAssessmentContext = {},
  ): Confidence {
    const kpis = context.kpis ?? [];
    const expectedKpiCount =
      context.expectedKpiCount ??
      Math.max(kpis.length, healthScore.categoryScores.length);

    return this.calculateFromKpis(kpis, {
      ...context,
      expectedKpiCount,
      referenceTime: context.referenceTime ?? healthScore.timestamp,
    });
  }
}
