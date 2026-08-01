import { describe, expect, it } from "vitest";
import { composeExecutiveBriefV1 } from "@/lib/executive/brief/compose-executive-brief-v1";
import { buildSeedDecisions } from "@/lib/decisions/data/seed-decisions";
import { executiveLearningEngine } from "@/lib/decisions/learning/ExecutiveLearningEngine";

describe("Mission P-002 Executive Brief v1.0", () => {
  it("composes all ten executive brief sections", () => {
    const decisions = buildSeedDecisions();
    const learning = executiveLearningEngine.buildSnapshot(
      decisions,
      "user-executive",
      "Mohammad Shafi",
    );

    const brief = composeExecutiveBriefV1({
      executiveName: "Mohammad Shafi",
      organizationName: "ORANIA Hospitality Group",
      profileLabel: "Executive",
      decisions,
      learning,
    });

    expect(brief.greeting.organizationName).toBe("ORANIA Hospitality Group");
    expect(brief.greeting.operatingMode).toBeTruthy();
    expect(brief.businessHealth.majorRisks.length).toBeGreaterThanOrEqual(0);
    expect(brief.priorityDecisions.length).toBeGreaterThan(0);
    expect(brief.executiveDecisions.pending.length).toBeGreaterThan(0);
    expect(brief.crossWorkspaceSignals.length).toBe(8);
    expect(brief.executiveMemory.length).toBeGreaterThan(0);
    expect(brief.businessTrends.length).toBeGreaterThan(0);
    expect(brief.morningSummary.todaySummary.length).toBeGreaterThan(0);
    expect(brief.recommendations[0]?.businessValue).toBeTruthy();
    expect(brief.recommendations[0]?.alternativeActions?.length).toBeGreaterThan(0);
  });

  it("enriches recommendations with P-002 decision fields", () => {
    const brief = composeExecutiveBriefV1({
      executiveName: "Mohammad Shafi",
      decisions: [],
    });

    const recommendation = brief.recommendations[0];
    expect(recommendation).toMatchObject({
      businessValue: expect.any(String),
      riskLevel: expect.any(String),
      expectedOutcome: expect.any(String),
      alternativeActions: expect.any(Array),
    });
    expect(recommendation?.actions).toContain("reject");
    expect(recommendation?.actions).toContain("complete");
  });
});
