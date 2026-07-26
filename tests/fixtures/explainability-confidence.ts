import type { KPIInput } from "@/lib/business-health/models/KPI";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import type { ConfidenceAssessmentInput } from "@/lib/explainability/engine/ConfidenceCalculator";

export const REFERENCE_TIME = "2026-07-26T12:00:00.000Z";
export const FRESH_TIMESTAMP = "2026-07-26T11:30:00.000Z";
export const STALE_TIMESTAMP = "2026-07-26T06:00:00.000Z";

export function createConfidenceKPI(
  overrides: Partial<KPIInput> & Pick<KPIInput, "id" | "name" | "category">,
) {
  return finalizeKPI({
    description: "Confidence test KPI",
    currentValue: 100,
    previousValue: 95,
    targetValue: 100,
    weight: 1,
    source: "ga4",
    confidence: 95,
    timestamp: FRESH_TIMESTAMP,
    ...overrides,
  });
}

export function createPerfectAssessmentInput(
  generatedAt: string = REFERENCE_TIME,
): ConfidenceAssessmentInput {
  return {
    missingKpiCount: 0,
    staleKpiCount: 0,
    unavailableProviderCount: 0,
    estimatedValueCount: 0,
    incompleteNormalizationCount: 0,
    validationFailureCount: 0,
    generatedAt,
  };
}
