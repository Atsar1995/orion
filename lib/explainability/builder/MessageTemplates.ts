/** Variables substituted into deterministic message templates. */
export type TemplateVariables = Record<string, string | number>;

/** Reusable template definition with identifier and pattern. */
export type MessageTemplate = {
  readonly id: string;
  readonly pattern: string;
};

/** Substitutes `{variable}` placeholders in a template pattern. */
export function renderTemplate(
  template: MessageTemplate | string,
  variables: TemplateVariables,
): string {
  const pattern = typeof template === "string" ? template : template.pattern;

  return pattern.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = variables[key];
    return value === undefined ? "" : String(value);
  });
}

export const EXPLANATION_ITEM_TEMPLATES = {
  positiveTitle: { id: "positive-title", pattern: "Strength in {category}" },
  negativeTitle: { id: "negative-title", pattern: "Pressure from {category}" },
  neutralTitle: { id: "neutral-title", pattern: "Stable {category}" },
  positiveSummary: {
    id: "positive-summary",
    pattern: "{category} contributes +{contribution} points. {explanation}",
  },
  negativeSummary: {
    id: "negative-summary",
    pattern: "{category} reduces the score by {contribution} points. {explanation}",
  },
  neutralSummary: {
    id: "neutral-summary",
    pattern: "{category} is neutral with no net contribution. {explanation}",
  },
} as const satisfies Record<string, MessageTemplate>;

export const FORMATTER_TEMPLATES = {
  headline: {
    id: "explanation-headline",
    pattern: "Business health is {score} ({status}) with {confidenceLevel} confidence.",
  },
  positiveHighlight: {
    id: "positive-highlight",
    pattern: "{category} (+{contribution}): {explanation}",
  },
  negativeHighlight: {
    id: "negative-highlight",
    pattern: "{category} ({contribution}): {explanation}",
  },
  neutralNote: {
    id: "neutral-note",
    pattern: "{category} is holding steady with no material impact.",
  },
  driverSummary: {
    id: "driver-summary",
    pattern: "{title} — {description}",
  },
  confidenceHigh: {
    id: "confidence-high",
    pattern: "Assessment confidence is high at {confidenceScore}%.",
  },
  confidenceModerate: {
    id: "confidence-moderate",
    pattern: "Assessment confidence is moderate at {confidenceScore}%.",
  },
  confidenceLow: {
    id: "confidence-low",
    pattern: "Confidence is low ({confidenceScore}%). Treat conclusions with caution.",
  },
  confidenceInsufficient: {
    id: "confidence-insufficient",
    pattern: "Insufficient data confidence ({confidenceScore}%). Review data coverage before acting.",
  },
  emptyDrivers: {
    id: "empty-drivers",
    pattern: "No contributor breakdown is available for this assessment.",
  },
} as const satisfies Record<string, MessageTemplate>;

export const NARRATIVE_TEMPLATES = {
  summaryWithOffset: {
    id: "summary-with-offset",
    pattern:
      "Health is {score} ({status}) driven by {topPositive}, partially offset by {topNegative}.",
  },
  summaryStrengthOnly: {
    id: "summary-strength-only",
    pattern: "Health is {score} ({status}) with strength in {topPositive}.",
  },
  summaryNoDrivers: {
    id: "summary-no-drivers",
    pattern: "Health is {score} ({status}) with limited driver detail available.",
  },
  summaryLowConfidence: {
    id: "summary-low-confidence",
    pattern: "Health is {score} ({status}); confidence is limited ({confidenceLevel}).",
  },
  healthyStable: {
    id: "healthy-stable",
    pattern: "Business health remains strong at {score} with balanced category performance.",
  },
  healthyImproving: {
    id: "healthy-improving",
    pattern: "Business health is healthy at {score} with positive momentum in key areas.",
  },
  fairAttention: {
    id: "fair-attention",
    pattern: "Business health at {score} needs attention across weaker categories.",
  },
  poorCritical: {
    id: "poor-critical",
    pattern: "Business health at {score} requires immediate executive review.",
  },
  lowConfidenceInterpretation: {
    id: "low-confidence-interpretation",
    pattern:
      "The assessment has {confidenceLevel} confidence ({confidenceScore}%). Validate source data before decisions.",
  },
  strengthBullet: {
    id: "strength-bullet",
    pattern: "{category} contributes +{contribution} points.",
  },
  concernBullet: {
    id: "concern-bullet",
    pattern: "{category} reduces health by {contribution} points.",
  },
  confidenceConcern: {
    id: "confidence-concern",
    pattern: "Data confidence is {confidenceLevel} ({confidenceScore}%).",
  },
  noStrengths: {
    id: "no-strengths",
    pattern: "No positive contributors were identified in this assessment.",
  },
  noConcerns: {
    id: "no-concerns",
    pattern: "No negative contributors were identified in this assessment.",
  },
} as const satisfies Record<string, MessageTemplate>;

export type NarrativeTemplateId = keyof typeof NARRATIVE_TEMPLATES;
