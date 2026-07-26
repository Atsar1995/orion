import { describe, expect, it } from "vitest";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import {
  DEFAULT_EXPLAINABILITY_CONFIG,
  ExplainabilityEngine,
  isExplainabilitySuccess,
} from "@/lib/explainability";
import {
  createConfidenceKPI,
  FRESH_TIMESTAMP,
  REFERENCE_TIME,
} from "@/tests/fixtures/explainability-confidence";
import {
  createAllPositiveHealthScore,
  createEmptyHealthScore,
  createSampleHealthScore,
} from "@/tests/fixtures/explainability-builder";

describe("ExplainabilityEngine integration", () => {
  it("generates a healthy-business explanation end-to-end", () => {
    const engine = new ExplainabilityEngine();
    const result = engine.explain(createAllPositiveHealthScore(), {
      referenceTime: REFERENCE_TIME,
      expectedKpiCount: 2,
      kpis: [
        createConfidenceKPI({ id: "rev", name: "Revenue", category: "revenue" }),
        createConfidenceKPI({ id: "mkt", name: "Marketing", category: "marketing" }),
      ],
    });

    expect(result.success).toBe(true);
    if (!isExplainabilitySuccess(result)) {
      return;
    }

    expect(result.data.explanation.businessHealthScore.overallScore).toBe(85);
    expect(result.data.explanation.explanationItems.length).toBeGreaterThan(0);
    expect(result.data.explanation.executiveNarrative.summary).toContain("strength");
    expect(result.data.explanation.confidence.level).toBe("high");
    expect(result.data.executionMs).toBeGreaterThanOrEqual(0);
  });

  it("generates mixed-performance explanations with ranked contributors", () => {
    const engine = new ExplainabilityEngine();
    const result = engine.explain(createSampleHealthScore());

    expect(result.success).toBe(true);
    if (!isExplainabilitySuccess(result)) {
      return;
    }

    const { explanation } = result.data;
    expect(explanation.explanationItems.some((item) => item.contribution > 0)).toBe(true);
    expect(explanation.explanationItems.some((item) => item.contribution < 0)).toBe(true);
    expect(explanation.executiveNarrative.summary).toContain("Revenue");
    expect(explanation.executiveNarrative.concerns.some((entry) => entry.includes("Marketing"))).toBe(
      true,
    );
  });

  it("surfaces low-confidence assessments through the integrated pipeline", () => {
    const engine = new ExplainabilityEngine();
    const result = engine.explain(createSampleHealthScore(), {
      referenceTime: REFERENCE_TIME,
      expectedKpiCount: 6,
      missingProviders: ["ga4", "shopify"],
      validationFailureCount: 1,
      kpis: [
        createConfidenceKPI({ id: "rev", name: "Revenue", category: "revenue" }),
      ],
    });

    expect(result.success).toBe(true);
    if (!isExplainabilitySuccess(result)) {
      return;
    }

    expect(result.data.explanation.confidence.level).toBe("insufficient");
    expect(result.data.explanation.executiveNarrative.summary).toContain("confidence is limited");
    expect(
      result.data.explanation.executiveNarrative.concerns.some((entry) =>
        entry.includes("insufficient"),
      ),
    ).toBe(true);
  });

  it("handles missing KPI expectations in explainFromKPIs", () => {
    const engine = new ExplainabilityEngine();
    const result = engine.explainFromKPIs(
      [
        finalizeKPI({
          id: "rev",
          name: "Revenue",
          category: "revenue",
          description: "Revenue KPI",
          currentValue: 120,
          previousValue: 100,
          targetValue: 100,
          weight: 1,
          source: "ga4",
          confidence: 95,
          timestamp: FRESH_TIMESTAMP,
        }),
      ],
      {
        referenceTime: REFERENCE_TIME,
        expectedKpiCount: 4,
      },
    );

    expect(result.success).toBe(true);
    if (!isExplainabilitySuccess(result)) {
      return;
    }

    expect(result.data.explanation.confidence.score).toBeLessThan(100);
    expect(
      result.data.explanation.confidence.factors.some((factor) => factor.type === "missing_kpi"),
    ).toBe(true);
  });

  it("handles empty assessments through explain()", () => {
    const engine = new ExplainabilityEngine();
    const healthScore = createEmptyHealthScore();
    const result = engine.explain(healthScore, {
      referenceTime: REFERENCE_TIME,
      expectedKpiCount: 4,
      missingProviders: ["ga4", "shopify"],
      validationFailureCount: 2,
      kpis: [],
    });

    expect(result.success).toBe(true);
    if (!isExplainabilitySuccess(result)) {
      return;
    }

    expect(result.data.explanation.explanationItems).toHaveLength(0);
    expect(result.data.explanation.confidence.level).toBe("insufficient");
    expect(result.data.explanation.executiveNarrative.summary).toContain("insufficient");
  });

  it("returns deterministic output for repeated execution", () => {
    const engine = new ExplainabilityEngine();
    const healthScore = createSampleHealthScore();
    const context = {
      referenceTime: REFERENCE_TIME,
      expectedKpiCount: 3,
      kpis: [
        createConfidenceKPI({ id: "rev", name: "Revenue", category: "revenue" }),
        createConfidenceKPI({ id: "mkt", name: "Marketing", category: "marketing" }),
      ],
    };

    const first = engine.explain(healthScore, context);
    const second = engine.explain(healthScore, context);

    expect(first.success && second.success).toBe(true);
    if (!isExplainabilitySuccess(first) || !isExplainabilitySuccess(second)) {
      return;
    }

    expect(first.data.explanation).toEqual(second.data.explanation);
  });

  it("completes integrated execution within the configured performance budget", () => {
    const engine = new ExplainabilityEngine();
    const result = engine.explain(createSampleHealthScore(), {
      referenceTime: REFERENCE_TIME,
      kpis: [
        createConfidenceKPI({ id: "rev", name: "Revenue", category: "revenue" }),
        createConfidenceKPI({ id: "ops", name: "Operations", category: "operations" }),
        createConfidenceKPI({ id: "mkt", name: "Marketing", category: "marketing" }),
      ],
    });

    expect(result.success).toBe(true);
    if (!isExplainabilitySuccess(result)) {
      return;
    }

    expect(result.data.executionMs).toBeLessThan(DEFAULT_EXPLAINABILITY_CONFIG.maxExecutionMs);
  });

  it("rejects explainFromKPIs when no KPI signals are supplied", () => {
    const engine = new ExplainabilityEngine();
    const result = engine.explainFromKPIs([]);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe("EMPTY_INPUT");
  });

  it("maps business health failures without throwing", () => {
    const engine = new ExplainabilityEngine();
    const invalidScore = {
      ...createSampleHealthScore(),
      overallScore: Number.NaN,
    };
    const result = engine.explain(invalidScore);

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe("INVALID_HEALTH_SCORE");
  });
});

describe("ExplainabilityPipeline integration", () => {
  it("uses executive narrative engine output in the final explanation bundle", () => {
    const engine = new ExplainabilityEngine();
    const healthScore = createSampleHealthScore();
    const direct = engine.explain(healthScore, {
      referenceTime: REFERENCE_TIME,
      expectedKpiCount: 6,
      missingProviders: ["ga4", "shopify"],
      validationFailureCount: 2,
      kpis: [createConfidenceKPI({ id: "rev", name: "Revenue", category: "revenue" })],
    });

    expect(direct.success).toBe(true);
    if (!isExplainabilitySuccess(direct)) {
      return;
    }

    expect(direct.data.explanation.executiveNarrative.interpretation).toContain(
      "Validate source data",
    );
    expect(["low", "insufficient"]).toContain(direct.data.explanation.confidence.level);
  });
});
