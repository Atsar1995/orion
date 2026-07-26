import { describe, expect, it } from "vitest";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import {
  calculateConfidence,
  clampConfidenceScore,
  resolveConfidenceLevel,
} from "@/lib/explainability/engine/ConfidenceCalculator";
import { ConfidenceEngine } from "@/lib/explainability/engine/ConfidenceEngine";
import { DEFAULT_CONFIDENCE_RULES } from "@/lib/explainability/engine/ConfidenceRules";
import {
  createConfidenceKPI,
  createPerfectAssessmentInput,
  FRESH_TIMESTAMP,
  REFERENCE_TIME,
  STALE_TIMESTAMP,
} from "@/tests/fixtures/explainability-confidence";

describe("ConfidenceCalculator", () => {
  it("returns a perfect score when no deductions apply", () => {
    const result = calculateConfidence(createPerfectAssessmentInput());

    expect(result.score).toBe(100);
    expect(result.level).toBe("high");
    expect(result.factors).toHaveLength(1);
    expect(result.factors[0]?.type).toBe("complete_dataset");
  });

  it("applies partial data deductions deterministically", () => {
    const result = calculateConfidence({
      ...createPerfectAssessmentInput(),
      missingKpiCount: 1,
      staleKpiCount: 1,
    });

    expect(result.score).toBe(86);
    expect(result.factors).toHaveLength(2);
    expect(result.factors.map((factor) => factor.type)).toEqual(["missing_kpi", "stale_data"]);
  });

  it("deducts for unavailable providers", () => {
    const result = calculateConfidence({
      ...createPerfectAssessmentInput(),
      unavailableProviderCount: 2,
    });

    expect(result.score).toBe(76);
    expect(result.level).toBe("high");
  });

  it("combines multiple deductions", () => {
    const result = calculateConfidence({
      generatedAt: REFERENCE_TIME,
      missingKpiCount: 2,
      staleKpiCount: 1,
      unavailableProviderCount: 1,
      estimatedValueCount: 2,
      incompleteNormalizationCount: 1,
      validationFailureCount: 1,
    });

    expect(result.score).toBe(31);
    expect(result.level).toBe("insufficient");
    expect(result.factors).toHaveLength(6);
  });

  it("clamps scores below zero and above one hundred", () => {
    expect(clampConfidenceScore(-25)).toBe(0);
    expect(clampConfidenceScore(140)).toBe(100);
    expect(clampConfidenceScore(82.456)).toBe(82.5);
  });

  it("resolves confidence levels from configurable thresholds", () => {
    const thresholds = DEFAULT_CONFIDENCE_RULES.levelThresholds;

    expect(resolveConfidenceLevel(90, thresholds)).toBe("high");
    expect(resolveConfidenceLevel(70, thresholds)).toBe("moderate");
    expect(resolveConfidenceLevel(45, thresholds)).toBe("low");
    expect(resolveConfidenceLevel(20, thresholds)).toBe("insufficient");
  });

  it("produces identical output for identical input", () => {
    const input = {
      ...createPerfectAssessmentInput(),
      missingKpiCount: 1,
      validationFailureCount: 1,
    };

    expect(calculateConfidence(input)).toEqual(calculateConfidence(input));
  });
});

describe("ConfidenceEngine", () => {
  it("derives confidence from fresh normalized KPIs", () => {
    const engine = new ConfidenceEngine();
    const result = engine.calculateFromKpis(
      [
        createConfidenceKPI({ id: "rev", name: "Revenue", category: "revenue" }),
        createConfidenceKPI({ id: "sessions", name: "Sessions", category: "marketing" }),
      ],
      {
        referenceTime: REFERENCE_TIME,
        expectedKpiCount: 2,
      },
    );

    expect(result.score).toBe(100);
    expect(result.level).toBe("high");
  });

  it("detects missing KPIs from expected counts", () => {
    const engine = new ConfidenceEngine();
    const result = engine.calculateFromKpis(
      [createConfidenceKPI({ id: "rev", name: "Revenue", category: "revenue" })],
      {
        referenceTime: REFERENCE_TIME,
        expectedKpiCount: 3,
      },
    );

    expect(result.score).toBe(84);
    expect(result.factors.some((factor) => factor.type === "missing_kpi")).toBe(true);
  });

  it("detects stale KPI timestamps", () => {
    const engine = new ConfidenceEngine();
    const result = engine.calculateFromKpis(
      [
        createConfidenceKPI({
          id: "rev",
          name: "Revenue",
          category: "revenue",
          timestamp: STALE_TIMESTAMP,
        }),
      ],
      { referenceTime: REFERENCE_TIME, expectedKpiCount: 1 },
    );

    expect(result.score).toBe(94);
    expect(result.factors.some((factor) => factor.type === "stale_data")).toBe(true);
  });

  it("detects estimated manual KPI values", () => {
    const engine = new ConfidenceEngine();
    const result = engine.calculateFromKpis(
      [
        finalizeKPI({
          id: "manual",
          name: "Manual Revenue",
          category: "revenue",
          description: "Manual import",
          currentValue: 100,
          previousValue: 90,
          targetValue: 100,
          weight: 1,
          source: "manual",
          confidence: 90,
          timestamp: FRESH_TIMESTAMP,
        }),
      ],
      { referenceTime: REFERENCE_TIME, expectedKpiCount: 1 },
    );

    expect(result.score).toBe(95);
    expect(result.factors.some((factor) => factor.type === "estimated_value")).toBe(true);
  });

  it("includes missing provider deductions from context", () => {
    const engine = new ConfidenceEngine();
    const result = engine.calculateFromKpis([], {
      referenceTime: REFERENCE_TIME,
      expectedKpiCount: 0,
      missingProviders: ["ga4", "shopify"],
    });

    expect(result.score).toBe(76);
    expect(result.factors.some((factor) => factor.type === "provider_delay")).toBe(true);
  });

  it("accepts direct assessment input through the orchestration layer", () => {
    const engine = new ConfidenceEngine();
    const result = engine.calculate({
      ...createPerfectAssessmentInput(),
      validationFailureCount: 2,
    });

    expect(result.score).toBe(70);
    expect(result.level).toBe("moderate");
  });

  it("derives confidence from a health score timestamp and KPI context", () => {
    const engine = new ConfidenceEngine();
    const result = engine.calculateFromHealthScore(
      {
        overallScore: 82,
        status: "healthy",
        categoryScores: [],
        confidence: 90,
        timestamp: REFERENCE_TIME,
        summary: "Business health is stable.",
        breakdown: [],
      },
      {
        kpis: [
          createConfidenceKPI({
            id: "ops",
            name: "Operations Load",
            category: "operations",
            timestamp: STALE_TIMESTAMP,
          }),
        ],
        expectedKpiCount: 1,
        incompleteNormalizationCount: 1,
      },
    );

    expect(result.score).toBe(84);
    expect(result.generatedAt).toBe(REFERENCE_TIME);
  });
});
