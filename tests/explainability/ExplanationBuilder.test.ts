import { describe, expect, it } from "vitest";
import {
  ContributionAnalyzer,
  ExplanationBuilder,
  ExplanationFormatter,
  NarrativeComposer,
  renderTemplate,
  NARRATIVE_TEMPLATES,
} from "@/lib/explainability/builder";
import {
  createAllNegativeHealthScore,
  createAllPositiveHealthScore,
  createBreakdownEntry,
  createEmptyHealthScore,
  createLowConfidenceAssessment,
  createSampleConfidence,
  createSampleHealthScore,
} from "@/tests/fixtures/explainability-builder";

describe("ContributionAnalyzer", () => {
  it("ranks contributors by absolute contribution descending", () => {
    const analyzer = new ContributionAnalyzer();
    const analysis = analyzer.analyze([
      createBreakdownEntry({ category: "Marketing", contribution: -8.2 }),
      createBreakdownEntry({ category: "Revenue", contribution: 12.5 }),
      createBreakdownEntry({ category: "Operations", contribution: 0 }),
    ]);

    expect(analysis.all.map((entry) => entry.breakdown.category)).toEqual([
      "Revenue",
      "Marketing",
      "Operations",
    ]);
    expect(analysis.positives).toHaveLength(1);
    expect(analysis.negatives).toHaveLength(1);
    expect(analysis.neutrals).toHaveLength(1);
  });

  it("assigns strongest positives and negatives", () => {
    const analyzer = new ContributionAnalyzer();
    const analysis = analyzer.analyze(createSampleHealthScore().breakdown, createSampleHealthScore().categoryScores);

    expect(analysis.positives[0]?.breakdown.category).toBe("Revenue");
    expect(analysis.negatives[0]?.breakdown.category).toBe("Marketing");
    expect(analysis.neutrals[0]?.breakdown.category).toBe("Operations");
  });

  it("maps explanation items with importance and category metadata", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createSampleHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown, healthScore.categoryScores);

    expect(analysis.explanationItems[0]?.importance).toBe("high");
    expect(analysis.explanationItems[0]?.category).toBe("revenue");
    expect(analysis.explanationItems[0]?.contribution).toBe(12.5);
  });

  it("handles empty datasets without throwing", () => {
    const analyzer = new ContributionAnalyzer();
    const analysis = analyzer.analyze([], []);

    expect(analysis.all).toHaveLength(0);
    expect(analysis.positives).toHaveLength(0);
    expect(analysis.negatives).toHaveLength(0);
    expect(analysis.neutrals).toHaveLength(0);
    expect(analysis.explanationItems).toHaveLength(0);
  });

  it("produces deterministic rankings for identical input", () => {
    const analyzer = new ContributionAnalyzer();
    const breakdown = createSampleHealthScore().breakdown;

    expect(analyzer.analyze(breakdown)).toEqual(analyzer.analyze(breakdown));
  });
});

describe("ExplanationFormatter", () => {
  it("formats executive-readable highlights for mixed contributions", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createSampleHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown, healthScore.categoryScores);
    const formatter = new ExplanationFormatter();

    const formatted = formatter.format({
      overallScore: healthScore.overallScore,
      status: healthScore.status,
      confidence: createSampleConfidence(),
      analysis,
      explanationItems: analysis.explanationItems,
    });

    expect(formatted.headline).toContain("78.4");
    expect(formatted.headline).toContain("healthy");
    expect(formatted.positiveHighlights[0]).toContain("Revenue");
    expect(formatted.negativeHighlights[0]).toContain("Marketing");
    expect(formatted.neutralNotes[0]).toContain("Operations");
    expect(formatted.confidenceNote).toContain("high");
    expect(formatted.driverSummaries.length).toBe(analysis.explanationItems.length);
  });

  it("returns empty-driver messaging for empty datasets", () => {
    const analyzer = new ContributionAnalyzer();
    const analysis = analyzer.analyze([]);
    const formatter = new ExplanationFormatter();

    const formatted = formatter.format({
      overallScore: 0,
      status: "critical",
      confidence: createLowConfidenceAssessment(),
      analysis,
      explanationItems: [],
    });

    expect(formatted.driverSummaries[0]).toContain("No contributor breakdown");
    expect(formatted.positiveHighlights).toHaveLength(0);
    expect(formatted.negativeHighlights).toHaveLength(0);
    expect(formatted.confidenceNote).toContain("Insufficient data confidence");
  });

  it("uses low-confidence formatting templates", () => {
    const analyzer = new ContributionAnalyzer();
    const analysis = analyzer.analyze(createAllNegativeHealthScore().breakdown);
    const formatter = new ExplanationFormatter();

    const formatted = formatter.format({
      overallScore: 42,
      status: "poor",
      confidence: createSampleConfidence({ score: 52, level: "low" }),
      analysis,
      explanationItems: analysis.explanationItems,
    });

    expect(formatted.confidenceNote).toContain("Confidence is low");
  });
});

describe("NarrativeComposer", () => {
  it("composes deterministic executive narratives for mixed contributions", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createSampleHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown, healthScore.categoryScores);
    const composer = new NarrativeComposer();

    const narrative = composer.compose({
      healthScore,
      confidence: createSampleConfidence(),
      analysis,
    });

    expect(narrative.summary).toContain("Revenue");
    expect(narrative.summary.split(/\s+/).length).toBeLessThanOrEqual(20);
    expect(narrative.strengths[0]).toContain("Revenue");
    expect(narrative.concerns.some((entry) => entry.includes("Marketing"))).toBe(true);
    expect(narrative.interpretation).toContain("78.4");
  });

  it("omits offset wording when only positive drivers exist", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createAllPositiveHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown);
    const composer = new NarrativeComposer();

    const narrative = composer.compose({
      healthScore,
      confidence: createSampleConfidence(),
      analysis,
    });

    expect(narrative.summary).toContain("strength");
    expect(narrative.summary).not.toContain("partially offset");
    expect(narrative.concerns.some((entry) => entry.includes("No negative contributors"))).toBe(true);
  });

  it("handles all-negative datasets with concern bullets", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createAllNegativeHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown);
    const composer = new NarrativeComposer();

    const narrative = composer.compose({
      healthScore,
      confidence: createSampleConfidence({ score: 70, level: "moderate" }),
      analysis,
    });

    expect(narrative.strengths[0]).toContain("No positive contributors");
    expect(narrative.concerns.some((entry) => entry.includes("Revenue"))).toBe(true);
    expect(narrative.interpretation).toContain("requires immediate executive review");
  });

  it("adds confidence caveats for insufficient assessments", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createSampleHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown);
    const composer = new NarrativeComposer();

    const narrative = composer.compose({
      healthScore,
      confidence: createLowConfidenceAssessment(),
      analysis,
    });

    expect(narrative.summary).toContain("confidence is limited");
    expect(narrative.concerns.some((entry) => entry.includes("insufficient"))).toBe(true);
    expect(narrative.interpretation).toContain("Validate source data");
  });

  it("handles empty breakdown datasets", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createEmptyHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown);
    const composer = new NarrativeComposer();

    const narrative = composer.compose({
      healthScore,
      confidence: createLowConfidenceAssessment(),
      analysis,
    });

    expect(narrative.summary).toContain("confidence is limited");
    expect(narrative.strengths[0]).toContain("No positive contributors");
  });

  it("produces identical narrative output for identical input", () => {
    const analyzer = new ContributionAnalyzer();
    const healthScore = createSampleHealthScore();
    const analysis = analyzer.analyze(healthScore.breakdown, healthScore.categoryScores);
    const composer = new NarrativeComposer();
    const input = {
      healthScore,
      confidence: createSampleConfidence(),
      analysis,
    };

    expect(composer.compose(input)).toEqual(composer.compose(input));
  });
});

describe("ExplanationBuilder", () => {
  it("orchestrates a complete explanation bundle", () => {
    const builder = new ExplanationBuilder();
    const healthScore = createSampleHealthScore();
    const confidence = createSampleConfidence();

    const explanation = builder.build({ healthScore, confidence });

    expect(explanation.businessHealthScore).toBe(healthScore);
    expect(explanation.confidence).toBe(confidence);
    expect(explanation.categoryBreakdown).toEqual(healthScore.categoryScores);
    expect(explanation.explanationItems.length).toBe(healthScore.breakdown.length);
    expect(explanation.executiveNarrative.summary.length).toBeGreaterThan(0);
    expect(explanation.executiveNarrative.interpretation).toContain("Assessment confidence is high");
    expect(explanation.generatedAt).toBe(confidence.generatedAt);
  });

  it("supports recommendation context passthrough", () => {
    const builder = new ExplanationBuilder();
    const recommendationContext = [
      {
        type: "revenue" as const,
        label: "Revenue recovery",
        description: "Focus on revenue KPI recovery.",
        relatedCategories: ["revenue"],
      },
    ];

    const explanation = builder.build({
      healthScore: createSampleHealthScore(),
      confidence: createSampleConfidence(),
      recommendationContext,
    });

    expect(explanation.recommendationContext).toEqual(recommendationContext);
  });

  it("builds deterministic explanations for edge-case datasets", () => {
    const builder = new ExplanationBuilder();
    const input = {
      healthScore: createEmptyHealthScore(),
      confidence: createLowConfidenceAssessment(),
    };

    expect(builder.build(input)).toEqual(builder.build(input));
  });
});

describe("MessageTemplates", () => {
  it("renders reusable templates deterministically", () => {
    const rendered = renderTemplate(NARRATIVE_TEMPLATES.summaryWithOffset, {
      score: "82.0",
      status: "healthy",
      topPositive: "Revenue",
      topNegative: "Marketing",
    });

    expect(rendered).toBe(
      "Health is 82.0 (healthy) driven by Revenue, partially offset by Marketing.",
    );
  });
});
