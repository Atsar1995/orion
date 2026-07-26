import { describe, expect, it } from "vitest";
import {
  ConcernExtractor,
  countExecutiveWords,
  ExecutiveNarrativeEngine,
  ExecutiveSummaryBuilder,
  EXECUTIVE_NARRATIVE_TEMPLATES,
  InterpretationBuilder,
  renderNarrativeTemplate,
  StrengthExtractor,
} from "@/lib/explainability/narrative";
import {
  createAllNegativeHealthScore,
  createAllPositiveHealthScore,
  createEmptyHealthScore,
  createLowConfidenceAssessment,
  createSampleConfidence,
  createSampleHealthScore,
} from "@/tests/fixtures/explainability-builder";

describe("StrengthExtractor", () => {
  it("extracts strongest positive contributors in deterministic order", () => {
    const extractor = new StrengthExtractor();
    const strengths = extractor.extract(createSampleHealthScore().breakdown, 2);

    expect(strengths.map((entry) => entry.category)).toEqual(["Revenue"]);
    expect(strengths[0]?.contribution).toBeGreaterThan(0);
  });

  it("returns an empty list when no positive contributors exist", () => {
    const extractor = new StrengthExtractor();
    const strengths = extractor.extract(createAllNegativeHealthScore().breakdown);

    expect(strengths).toHaveLength(0);
  });
});

describe("ConcernExtractor", () => {
  it("extracts weakest contributors and confidence concerns", () => {
    const extractor = new ConcernExtractor();
    const extraction = extractor.extract(
      createSampleHealthScore().breakdown,
      createLowConfidenceAssessment(),
      2,
    );

    expect(extraction.contributors[0]?.category).toBe("Marketing");
    expect(extraction.confidenceConcerns.some((entry) => entry.includes("insufficient"))).toBe(true);
    expect(extraction.confidenceConcerns.some((entry) => entry.includes("missing"))).toBe(true);
  });

  it("returns no contributor concerns for all-positive datasets", () => {
    const extractor = new ConcernExtractor();
    const extraction = extractor.extract(
      createAllPositiveHealthScore().breakdown,
      createSampleConfidence(),
    );

    expect(extraction.contributors).toHaveLength(0);
    expect(extraction.confidenceConcerns).toHaveLength(0);
  });
});

describe("ExecutiveSummaryBuilder", () => {
  it("builds a mixed-performance executive summary", () => {
    const builder = new ExecutiveSummaryBuilder();
    const summary = builder.build({
      healthScore: createSampleHealthScore(),
      confidence: createSampleConfidence(),
    });

    expect(summary.combinedSummary).toContain("Revenue");
    expect(summary.combinedSummary).toContain("Marketing");
    expect(summary.confidenceSummary).toContain("high");
    expect(countExecutiveWords(summary.combinedSummary)).toBeLessThanOrEqual(20);
  });

  it("builds a declining-business summary", () => {
    const builder = new ExecutiveSummaryBuilder();
    const summary = builder.build({
      healthScore: createAllNegativeHealthScore(),
      confidence: createSampleConfidence({ score: 70, level: "moderate" }),
    });

    expect(summary.combinedSummary).toContain("pressure from");
    expect(summary.combinedSummary).toContain("Revenue");
    expect(summary.templateId).toBe(EXECUTIVE_NARRATIVE_TEMPLATES.summaryDeclining.id);
  });

  it("builds a missing-data summary for insufficient confidence", () => {
    const builder = new ExecutiveSummaryBuilder();
    const summary = builder.build({
      healthScore: createEmptyHealthScore(),
      confidence: createLowConfidenceAssessment(),
    });

    expect(summary.combinedSummary).toContain("insufficient");
    expect(summary.templateId).toBe(EXECUTIVE_NARRATIVE_TEMPLATES.summaryMissingData.id);
  });
});

describe("InterpretationBuilder", () => {
  it("selects a healthy-business interpretation template", () => {
    const builder = new InterpretationBuilder();
    const interpretation = builder.build({
      healthScore: createAllPositiveHealthScore(),
      confidence: createSampleConfidence(),
    });

    expect(interpretation.templateId).toBe("healthyStable");
    expect(interpretation.text).toContain("85.0");
  });

  it("selects a mixed-performance interpretation template", () => {
    const builder = new InterpretationBuilder();
    const interpretation = builder.build({
      healthScore: createSampleHealthScore(),
      confidence: createSampleConfidence(),
    });

    expect(interpretation.templateId).toBe("mixedPerformanceInterpretation");
    expect(interpretation.text).toContain("Revenue");
    expect(interpretation.text).toContain("Marketing");
  });

  it("selects a low-confidence interpretation template", () => {
    const builder = new InterpretationBuilder();
    const interpretation = builder.build({
      healthScore: createSampleHealthScore(),
      confidence: createLowConfidenceAssessment(),
    });

    expect(interpretation.templateId).toBe("lowConfidenceInterpretation");
    expect(interpretation.text).toContain("Validate source data");
  });

  it("selects a missing-data interpretation template", () => {
    const builder = new InterpretationBuilder();
    const interpretation = builder.build({
      healthScore: createEmptyHealthScore(),
      confidence: createLowConfidenceAssessment(),
    });

    expect(interpretation.templateId).toBe("missingDataInterpretation");
  });
});

describe("ExecutiveNarrativeEngine", () => {
  it("generates a healthy-business executive narrative", () => {
    const engine = new ExecutiveNarrativeEngine();
    const narrative = engine.generate({
      healthScore: createAllPositiveHealthScore(),
      confidence: createSampleConfidence(),
    });

    expect(narrative.summary).toContain("strength");
    expect(narrative.strengths[0]).toContain("Revenue");
    expect(narrative.concerns.some((entry) => entry.includes("No negative contributors"))).toBe(true);
    expect(narrative.interpretation).toContain("Assessment confidence is high");
  });

  it("generates a declining-business executive narrative", () => {
    const engine = new ExecutiveNarrativeEngine();
    const narrative = engine.generate({
      healthScore: createAllNegativeHealthScore(),
      confidence: createSampleConfidence({ score: 68, level: "moderate" }),
    });

    expect(narrative.summary).toContain("pressure from");
    expect(narrative.strengths[0]).toContain("No positive contributors");
    expect(narrative.concerns.some((entry) => entry.includes("Revenue"))).toBe(true);
    expect(narrative.interpretation).toContain("weakening");
  });

  it("generates mixed-performance narratives with confidence variations", () => {
    const engine = new ExecutiveNarrativeEngine();
    const narrative = engine.generate({
      healthScore: createSampleHealthScore(),
      confidence: createSampleConfidence({ score: 52, level: "low" }),
    });

    expect(narrative.summary).toContain("confidence is limited");
    expect(narrative.concerns.some((entry) => entry.includes("low"))).toBe(true);
    expect(narrative.interpretation).toContain("Validate source data");
  });

  it("handles missing data deterministically", () => {
    const engine = new ExecutiveNarrativeEngine();
    const input = {
      healthScore: createEmptyHealthScore(),
      confidence: createLowConfidenceAssessment(),
    };

    expect(engine.generate(input)).toEqual(engine.generate(input));
    expect(engine.generate(input).summary).toContain("insufficient");
  });

  it("produces deterministic output for identical input", () => {
    const engine = new ExecutiveNarrativeEngine();
    const input = {
      healthScore: createSampleHealthScore(),
      confidence: createSampleConfidence(),
    };

    expect(engine.generate(input)).toEqual(engine.generate(input));
  });
});

describe("NarrativeTemplates", () => {
  it("renders executive templates deterministically", () => {
    const rendered = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryWithOffset, {
      score: "78.4",
      status: "healthy",
      topPositive: "Revenue",
      topNegative: "Marketing",
    });

    expect(rendered).toBe(
      "Health is 78.4 (healthy) driven by Revenue, partially offset by Marketing.",
    );
  });
});
