import { describe, expect, it } from "vitest";
import {
  calculateImpactScore,
  deduplicateInsights,
  mapAlertSeverityToPriority,
  mapRecommendationPriority,
  rankByImpact,
  selectTopPriorities,
} from "@/lib/intelligence/brief/ExecutiveBriefPrioritizer";
import type { ExecutiveInsight } from "@/types/brief";

function insight(partial: Partial<ExecutiveInsight>): ExecutiveInsight {
  return {
    id: partial.id ?? "insight-1",
    title: partial.title ?? "Title",
    content: partial.content ?? "Content",
    category: partial.category ?? "key-highlights",
    priority: partial.priority ?? "medium",
    source: partial.source ?? "platform",
    impactScore: partial.impactScore ?? 200,
    ...partial,
  };
}

describe("ExecutiveBriefPrioritizer", () => {
  it("calculates impact score with priority, severity, and metric change", () => {
    expect(calculateImpactScore("critical", "critical", "+5")).toBeGreaterThan(
      calculateImpactScore("low", "info"),
    );
    expect(calculateImpactScore("medium", undefined, "-2")).toBeGreaterThan(
      calculateImpactScore("medium", undefined, "+1"),
    );
  });

  it("maps alert and recommendation priorities", () => {
    expect(mapAlertSeverityToPriority("critical")).toBe("critical");
    expect(mapAlertSeverityToPriority("attention")).toBe("high");
    expect(mapRecommendationPriority(1)).toBe("critical");
    expect(mapRecommendationPriority(4)).toBe("low");
  });

  it("deduplicates insights by dedupe key", () => {
    const insights = [
      insight({ id: "a", dedupeKey: "same-key" }),
      insight({ id: "b", dedupeKey: "same-key" }),
      insight({ id: "c", dedupeKey: "other-key" }),
    ];

    expect(deduplicateInsights(insights)).toHaveLength(2);
  });

  it("ranks insights by priority then impact score", () => {
    const ranked = rankByImpact([
      insight({ id: "low", priority: "low", impactScore: 999 }),
      insight({ id: "critical", priority: "critical", impactScore: 100 }),
    ]);

    expect(ranked[0]?.id).toBe("critical");
  });

  it("selects top priorities excluding executive summary", () => {
    const selected = selectTopPriorities(
      [
        insight({ id: "summary", category: "executive-summary", priority: "critical" }),
        insight({ id: "ops", category: "operations", priority: "high" }),
      ],
      1,
    );

    expect(selected).toHaveLength(1);
    expect(selected[0]?.id).toBe("ops");
  });
});
