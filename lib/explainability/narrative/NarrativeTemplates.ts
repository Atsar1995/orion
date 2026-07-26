/** Variables substituted into deterministic executive narrative templates. */
export type NarrativeTemplateVariables = Record<string, string | number>;

/** Reusable executive narrative template with traceable identifier. */
export type NarrativeTemplate = {
  readonly id: string;
  readonly pattern: string;
};

/** Substitutes `{variable}` placeholders in a narrative template pattern. */
export function renderNarrativeTemplate(
  template: NarrativeTemplate | string,
  variables: NarrativeTemplateVariables,
): string {
  const pattern = typeof template === "string" ? template : template.pattern;

  return pattern.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = variables[key];
    return value === undefined ? "" : String(value);
  });
}

export const EXECUTIVE_NARRATIVE_TEMPLATES = {
  summaryWithOffset: {
    id: "executive-summary-with-offset",
    pattern:
      "Health is {score} ({status}) driven by {topPositive}, partially offset by {topNegative}.",
  },
  summaryStrengthOnly: {
    id: "executive-summary-strength-only",
    pattern: "Health is {score} ({status}) with strength in {topPositive}.",
  },
  summaryDeclining: {
    id: "executive-summary-declining",
    pattern: "Health is {score} ({status}) with pressure from {topNegative}.",
  },
  summaryNoDrivers: {
    id: "executive-summary-no-drivers",
    pattern: "Health is {score} ({status}) with limited driver detail available.",
  },
  summaryLowConfidence: {
    id: "executive-summary-low-confidence",
    pattern: "Health is {score} ({status}); confidence is limited ({confidenceLevel}).",
  },
  summaryMissingData: {
    id: "executive-summary-missing-data",
    pattern: "Health assessment unavailable; data coverage is insufficient ({confidenceLevel}).",
  },
  confidenceSummaryHigh: {
    id: "executive-confidence-high",
    pattern: "Assessment confidence is high at {confidenceScore}%.",
  },
  confidenceSummaryModerate: {
    id: "executive-confidence-moderate",
    pattern: "Assessment confidence is moderate at {confidenceScore}%.",
  },
  confidenceSummaryLow: {
    id: "executive-confidence-low",
    pattern: "Confidence is low ({confidenceScore}%). Treat conclusions with caution.",
  },
  confidenceSummaryInsufficient: {
    id: "executive-confidence-insufficient",
    pattern: "Insufficient data confidence ({confidenceScore}%). Review coverage before acting.",
  },
  strengthBullet: {
    id: "executive-strength-bullet",
    pattern: "{category} contributes +{contribution} points.",
  },
  concernBullet: {
    id: "executive-concern-bullet",
    pattern: "{category} reduces health by {contribution} points.",
  },
  confidenceConcern: {
    id: "executive-confidence-concern",
    pattern: "Data confidence is {confidenceLevel} ({confidenceScore}%).",
  },
  confidenceFactorConcern: {
    id: "executive-confidence-factor-concern",
    pattern: "{factorDescription}",
  },
  noStrengths: {
    id: "executive-no-strengths",
    pattern: "No positive contributors were identified in this assessment.",
  },
  noConcerns: {
    id: "executive-no-concerns",
    pattern: "No negative contributors were identified in this assessment.",
  },
  healthyStable: {
    id: "executive-interpretation-healthy-stable",
    pattern: "Business health remains strong at {score} with balanced category performance.",
  },
  healthyImproving: {
    id: "executive-interpretation-healthy-improving",
    pattern: "Business health is healthy at {score} with positive momentum in key areas.",
  },
  decliningBusiness: {
    id: "executive-interpretation-declining",
    pattern: "Business health at {score} is weakening and requires focused recovery actions.",
  },
  fairAttention: {
    id: "executive-interpretation-fair-attention",
    pattern: "Business health at {score} needs attention across weaker categories.",
  },
  poorCritical: {
    id: "executive-interpretation-poor-critical",
    pattern: "Business health at {score} requires immediate executive review.",
  },
  lowConfidenceInterpretation: {
    id: "executive-interpretation-low-confidence",
    pattern:
      "The assessment has {confidenceLevel} confidence ({confidenceScore}%). Validate source data before decisions.",
  },
  missingDataInterpretation: {
    id: "executive-interpretation-missing-data",
    pattern: "Insufficient structured data prevents a reliable executive health interpretation.",
  },
  mixedPerformanceInterpretation: {
    id: "executive-interpretation-mixed-performance",
    pattern:
      "Performance is mixed at {score}: {topPositive} leads while {topNegative} weighs on results.",
  },
} as const satisfies Record<string, NarrativeTemplate>;

export type ExecutiveNarrativeTemplateId = keyof typeof EXECUTIVE_NARRATIVE_TEMPLATES;

export const DEFAULT_EXECUTIVE_SUMMARY_WORD_LIMIT = 20;

/** Counts words in an executive summary sentence. */
export function countExecutiveWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/** Enforces the executive summary word limit with deterministic fallback. */
export function enforceExecutiveSummaryWordLimit(
  summary: string,
  fallback: string,
  maxWords: number = DEFAULT_EXECUTIVE_SUMMARY_WORD_LIMIT,
): string {
  if (countExecutiveWords(summary) <= maxWords) {
    return summary;
  }

  if (countExecutiveWords(fallback) <= maxWords) {
    return fallback;
  }

  return fallback.split(/\s+/).slice(0, maxWords).join(" ");
}
