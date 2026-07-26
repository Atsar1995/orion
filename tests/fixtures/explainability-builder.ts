import type { CategoryScore, HealthScore } from "@/lib/business-health/models/HealthScore";
import type { ScoreBreakdown } from "@/lib/business-health/models/ScoreBreakdown";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import { REFERENCE_TIME } from "@/tests/fixtures/explainability-confidence";

export function createBreakdownEntry(
  overrides: Partial<ScoreBreakdown> & Pick<ScoreBreakdown, "category" | "contribution">,
): ScoreBreakdown {
  return {
    explanation: `${overrides.category} contribution detail.`,
    positiveContributions:
      overrides.contribution >= 0 ? [`${overrides.category}: +${overrides.contribution.toFixed(1)}`] : [],
    negativeContributions:
      overrides.contribution < 0 ? [`${overrides.category}: ${overrides.contribution.toFixed(1)}`] : [],
    ...overrides,
  };
}

export function createCategoryScore(
  overrides: Partial<CategoryScore> & Pick<CategoryScore, "categoryId" | "categoryName">,
): CategoryScore {
  return {
    score: 80,
    confidence: 90,
    weight: 1,
    breakdown: [],
    ...overrides,
  };
}

export function createSampleHealthScore(overrides: Partial<HealthScore> = {}): HealthScore {
  const categoryScores = overrides.categoryScores ?? [
    createCategoryScore({
      categoryId: "revenue",
      categoryName: "Revenue",
      score: 88,
      breakdown: [
        createBreakdownEntry({ category: "Monthly Revenue", contribution: 8, explanation: "Strong revenue." }),
      ],
    }),
    createCategoryScore({
      categoryId: "marketing",
      categoryName: "Marketing",
      score: 62,
      breakdown: [
        createBreakdownEntry({ category: "Sessions", contribution: -6, explanation: "Soft traffic." }),
      ],
    }),
    createCategoryScore({
      categoryId: "operations",
      categoryName: "Operations",
      score: 75,
      breakdown: [
        createBreakdownEntry({ category: "Fulfillment", contribution: 0, explanation: "Stable operations." }),
      ],
    }),
  ];

  const breakdown = overrides.breakdown ?? [
    createBreakdownEntry({
      category: "Revenue",
      contribution: 12.5,
      explanation: "Revenue scored 88/100 with weight 1.00.",
      positiveContributions: ["Monthly Revenue: +8.0"],
    }),
    createBreakdownEntry({
      category: "Marketing",
      contribution: -8.2,
      explanation: "Marketing scored 62/100 with weight 1.00.",
      negativeContributions: ["Sessions: -6.0"],
    }),
    createBreakdownEntry({
      category: "Operations",
      contribution: 0,
      explanation: "Operations scored 75/100 with weight 1.00.",
    }),
  ];

  return {
    overallScore: 78.4,
    status: "healthy",
    categoryScores,
    confidence: 88,
    timestamp: REFERENCE_TIME,
    summary: "Business health is healthy.",
    breakdown,
    ...overrides,
  };
}

export function createSampleConfidence(overrides: Partial<Confidence> = {}): Confidence {
  return {
    score: 88,
    level: "high",
    factors: [
      {
        type: "complete_dataset",
        description: "All expected KPI signals are present, fresh, and validated.",
        impact: 0,
        weight: 1,
      },
    ],
    generatedAt: REFERENCE_TIME,
    ...overrides,
  };
}

export function createEmptyHealthScore(): HealthScore {
  return {
    overallScore: 0,
    status: "critical",
    categoryScores: [],
    confidence: 0,
    timestamp: REFERENCE_TIME,
    summary: "No KPI data available.",
    breakdown: [],
  };
}

export function createAllPositiveHealthScore(): HealthScore {
  return createSampleHealthScore({
    overallScore: 85,
    status: "healthy",
    breakdown: [
      createBreakdownEntry({ category: "Revenue", contribution: 10, explanation: "Strong revenue." }),
      createBreakdownEntry({ category: "Marketing", contribution: 5, explanation: "Solid demand." }),
    ],
  });
}

export function createAllNegativeHealthScore(): HealthScore {
  return createSampleHealthScore({
    overallScore: 42,
    status: "poor",
    breakdown: [
      createBreakdownEntry({ category: "Revenue", contribution: -12, explanation: "Weak revenue." }),
      createBreakdownEntry({ category: "Marketing", contribution: -7, explanation: "Traffic decline." }),
    ],
  });
}

export function createLowConfidenceAssessment(): Confidence {
  return createSampleConfidence({
    score: 35,
    level: "insufficient",
    factors: [
      {
        type: "missing_kpi",
        description: "3 expected KPIs missing from the assessment (−24).",
        impact: -24,
        weight: 0.2,
      },
      {
        type: "validation_failure",
        description: "1 validation failure (−15).",
        impact: -15,
        weight: 0.2,
      },
    ],
  });
}
