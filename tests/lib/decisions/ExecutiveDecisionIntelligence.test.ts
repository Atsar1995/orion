import { describe, expect, it, beforeEach } from "vitest";
import { DecisionService } from "@/lib/decisions/DecisionService";
import { InMemoryDecisionRepository } from "@/lib/decisions/repository/InMemoryDecisionRepository";
import { buildSeedDecisions } from "@/lib/decisions/data/seed-decisions";
import { decisionEventStore } from "@/lib/decisions/events/DecisionEvents";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission S1B+ Executive Decision Intelligence", () => {
  let service: DecisionService;
  let repository: InMemoryDecisionRepository;

  beforeEach(() => {
    repository = new InMemoryDecisionRepository(buildSeedDecisions());
    service = new DecisionService(repository);
    decisionEventStore.clear();
  });

  it("creates a decision with recommendation intelligence and timeline", () => {
    const decision = service.createDecision(
      {
        recommendationId: "rec-new-1",
        title: "Renegotiate supplier contract",
        text: "High-value savings opportunity",
        evidence: [],
        confidenceScore: 88,
        confidenceLabel: "high",
        businessImpact: "42000 USD savings",
        priority: 1,
        workspace: "finance",
        workspaceId: "workspace-orania",
        estimatedValue: 42000,
      },
      CONTEXT,
    );

    expect(decision.status).toBe("recommended");
    expect(decision.recommendation.title).toBe("Renegotiate supplier contract");
    expect(decision.timeline.length).toBeGreaterThan(0);
  });

  it("deduplicates decisions by recommendation id", () => {
    const input = {
      recommendationId: "rec-dedupe",
      title: "Test",
      text: "Test",
      evidence: [],
      confidenceScore: 80,
      confidenceLabel: "high",
      businessImpact: "Impact",
      priority: 2,
      workspace: "crm",
      workspaceId: "workspace-orania",
    };

    const first = service.createDecision(input, CONTEXT);
    const second = service.createDecision(input, CONTEXT);

    expect(first.id).toBe(second.id);
  });

  it("records executive actions and updates timeline", () => {
    const created = service.createDecision(
      {
        recommendationId: "rec-action-1",
        title: "Approve budget shift",
        text: "Shift budget to high ROAS channel",
        evidence: [],
        confidenceScore: 82,
        confidenceLabel: "high",
        businessImpact: "Marketing efficiency",
        priority: 1,
        workspace: "marketing",
        workspaceId: "workspace-orania",
      },
      CONTEXT,
    );

    const updated = service.recordAction(
      created.id,
      { action: "accepted" },
      CONTEXT,
      "Mohammad Shafi",
    );

    expect(updated?.status).toBe("accepted");
    expect(updated?.actions).toHaveLength(1);
    expect(updated?.timeline.length).toBeGreaterThan(created.timeline.length);
  });

  it("completes a decision and attaches an outcome", () => {
    const created = service.createDecision(
      {
        recommendationId: "rec-complete-1",
        title: "Close enterprise deal",
        text: "Finalize Apex Retail contract",
        evidence: [],
        confidenceScore: 90,
        confidenceLabel: "high",
        businessImpact: "18400 USD",
        priority: 1,
        workspace: "crm",
        workspaceId: "workspace-orania",
        estimatedValue: 18400,
      },
      CONTEXT,
    );

    const completed = service.recordAction(
      created.id,
      { action: "completed" },
      CONTEXT,
      "Mohammad Shafi",
    );

    expect(completed?.status).toBe("completed");
    expect(completed?.outcomes.length).toBe(1);
  });

  it("searches decisions by status and workspace", () => {
    const results = service.searchDecisions({ status: "completed", workspace: "crm" }, CONTEXT);
    expect(results.every((decision) => decision.status === "completed")).toBe(true);
  });

  it("calculates learning metrics and analytics", () => {
    const learning = service.getLearningMetrics(CONTEXT);
    const analytics = service.getAnalytics(CONTEXT);

    expect(learning.acceptanceRate).toBeGreaterThan(0);
    expect(analytics.totalDecisions).toBeGreaterThan(0);
    expect(analytics.topRecommendationTypes.length).toBeGreaterThan(0);
  });

  it("returns brief intelligence summary", () => {
    const intelligence = service.getBriefIntelligence(CONTEXT);

    expect(intelligence.recommendationsGenerated).toBeGreaterThan(0);
    expect(intelligence.confidenceAccuracy).toBeGreaterThan(0);
    expect(intelligence.topRecommendation?.title).toBeTruthy();
  });

  it("emits decision events on create and action", () => {
    const decision = service.createDecision(
      {
        recommendationId: "rec-event-1",
        title: "Event test",
        text: "Event test",
        evidence: [],
        confidenceScore: 75,
        confidenceLabel: "medium",
        businessImpact: "Test",
        priority: 3,
        workspace: "executive",
        workspaceId: "workspace-orania",
      },
      CONTEXT,
    );

    service.recordAction(decision.id, { action: "delegated" }, CONTEXT, "Mohammad Shafi");

    expect(decisionEventStore.getByDecisionId(decision.id).length).toBeGreaterThan(0);
  });
});
