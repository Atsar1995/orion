import { describe, expect, it, beforeEach } from "vitest";
import { DecisionService } from "@/lib/decisions/DecisionService";
import { executiveLearningEngine } from "@/lib/decisions/learning/ExecutiveLearningEngine";
import { InMemoryDecisionRepository } from "@/lib/decisions/repository/InMemoryDecisionRepository";
import { buildSeedDecisions } from "@/lib/decisions/data/seed-decisions";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission S1F Executive Learning & Continuous Improvement", () => {
  let service: DecisionService;

  beforeEach(() => {
    service = new DecisionService(new InMemoryDecisionRepository(buildSeedDecisions()));
  });

  it("calculates recommendation quality metrics by type", () => {
    const snapshot = service.getExecutiveLearning(CONTEXT, "Mohammad Shafi");

    expect(snapshot.quality.byType.length).toBeGreaterThan(0);
    expect(snapshot.quality.overallCompletionRate).toBeGreaterThanOrEqual(0);
    expect(snapshot.quality.overallAverageTimeToActionHours).toBeGreaterThanOrEqual(0);
    expect(snapshot.quality.totalBusinessImpactRealized).toBeGreaterThan(0);
    expect(snapshot.quality.overallConfidenceCalibration).toBeGreaterThan(0);
  });

  it("measures executive behavior analytics", () => {
    const snapshot = service.getExecutiveLearning(CONTEXT, "Mohammad Shafi");

    expect(snapshot.behavior.decisionsPerDay.length).toBeGreaterThan(0);
    expect(snapshot.behavior.snoozeFrequency).toBeGreaterThanOrEqual(1);
    expect(snapshot.behavior.reopenedDecisions).toBeGreaterThanOrEqual(1);
    expect(snapshot.behavior.followThroughRate).toBeGreaterThanOrEqual(0);
  });

  it("builds outcome correlation chains", () => {
    const snapshot = service.getExecutiveLearning(CONTEXT, "Mohammad Shafi");

    expect(snapshot.correlations.length).toBeGreaterThan(0);
    expect(snapshot.correlations[0]).toMatchObject({
      recommendationTitle: expect.any(String),
      action: expect.any(String),
      outcomeValue: expect.any(Number),
      cycleHours: expect.any(Number),
    });
  });

  it("generates personalized executive scorecards", () => {
    const snapshot = service.getExecutiveLearning(CONTEXT, "Mohammad Shafi");

    expect(snapshot.scorecard.executiveId).toBe(CONTEXT.userId);
    expect(snapshot.scorecard.mostEffectiveCategories.length).toBeGreaterThan(0);
    expect(snapshot.scorecard.highImpactActions.length).toBeGreaterThan(0);
  });

  it("surfaces platform learning trends", () => {
    const snapshot = service.getExecutiveLearning(CONTEXT, "Mohammad Shafi");

    expect(snapshot.platformTrends.highestSuccessTypes.length).toBeGreaterThan(0);
    expect(snapshot.platformTrends.lowConfidenceSuccesses.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.platformTrends.highConfidenceRejections.length).toBeGreaterThanOrEqual(1);
  });

  it("generates executive insights for the daily brief", () => {
    const brief = service.getBriefIntelligence(CONTEXT, "Mohammad Shafi");

    expect(brief.insights).toBeDefined();
    expect(brief.insights!.length).toBeGreaterThan(0);
    expect(brief.insights![0]).toMatchObject({
      headline: expect.any(String),
      detail: expect.any(String),
      category: expect.any(String),
    });
  });

  it("embeds executive learning in analytics snapshot", () => {
    const analytics = service.getAnalytics(CONTEXT, "Mohammad Shafi");

    expect(analytics.executiveLearning).toBeDefined();
    expect(analytics.executiveLearning?.insights.length).toBeGreaterThan(0);
  });

  it("detects low-confidence successes and high-confidence rejections", () => {
    const snapshot = executiveLearningEngine.buildSnapshot(
      buildSeedDecisions(),
      CONTEXT.userId,
      "Mohammad Shafi",
    );

    const lowConf = snapshot.platformTrends.lowConfidenceSuccesses.find((entry) =>
      entry.title.includes("loyalty program"),
    );
    const highRej = snapshot.platformTrends.highConfidenceRejections.find((entry) =>
      entry.title.includes("Meridian"),
    );

    expect(lowConf?.confidenceScore).toBeLessThan(65);
    expect(highRej?.confidenceScore).toBeGreaterThanOrEqual(75);
  });
});
