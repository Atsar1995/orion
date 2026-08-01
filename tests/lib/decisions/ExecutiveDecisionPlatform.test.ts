import { describe, expect, it, beforeEach } from "vitest";
import { DecisionService } from "@/lib/decisions/DecisionService";
import { canTransition, normalizeDecisionStatus } from "@/lib/decisions/lifecycle/DecisionLifecycle";
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

describe("Mission P-003 Executive Decision Intelligence Platform", () => {
  let service: DecisionService;
  let repository: InMemoryDecisionRepository;

  beforeEach(() => {
    repository = new InMemoryDecisionRepository(buildSeedDecisions());
    service = new DecisionService(repository);
    decisionEventStore.clear();
  });

  it("creates decisions with full Canon model fields", () => {
    const decision = service.createDecision(
      {
        recommendationId: "rec-p003-1",
        title: "Renegotiate supplier contract",
        text: "High-value savings opportunity",
        evidence: [],
        confidenceScore: 88,
        confidenceLabel: "high",
        businessImpact: "42000 USD savings",
        priority: 1,
        urgency: "high",
        workspace: "finance",
        workspaceId: "workspace-orania",
        estimatedValue: 42000,
      },
      CONTEXT,
    );

    expect(decision.status).toBe("recommended");
    expect(decision.title).toBe("Renegotiate supplier contract");
    expect(decision.description).toBe("High-value savings opportunity");
    expect(decision.urgency).toBe("high");
    expect(decision.auditHistory.length).toBeGreaterThan(0);
    expect(decision.lessonsLearned).toEqual([]);
    expect(decision.attachments).toEqual([]);
  });

  it("validates lifecycle transitions", () => {
    expect(canTransition("recommended", "accepted")).toBe(true);
    expect(canTransition("completed", "accepted")).toBe(false);
    expect(normalizeDecisionStatus("new")).toBe("recommended");
    expect(normalizeDecisionStatus("snoozed")).toBe("deferred");
  });

  it("transitions decision status with audit trail", () => {
    const created = service.createDecision(
      {
        recommendationId: "rec-transition-1",
        title: "Review vendor terms",
        text: "Contract review",
        evidence: [],
        confidenceScore: 80,
        confidenceLabel: "high",
        businessImpact: "Cost reduction",
        priority: 2,
        workspace: "finance",
        workspaceId: "workspace-orania",
      },
      CONTEXT,
    );

    const updated = service.transitionToStatus(
      created.id,
      { toStatus: "pending_review", notes: "Needs CFO review" },
      CONTEXT,
      "Mohammad Shafi",
    );

    expect(updated?.status).toBe("pending_review");
    expect(updated?.auditHistory.length).toBeGreaterThan(created.auditHistory.length);
    expect(updated?.timeline.some((entry) => entry.type === "status_change")).toBe(true);
  });

  it("records comments and lessons on timeline", () => {
    const created = service.createDecision(
      {
        recommendationId: "rec-comment-1",
        title: "Expand loyalty program",
        text: "Guest retention initiative",
        evidence: [],
        confidenceScore: 75,
        confidenceLabel: "medium",
        businessImpact: "Retention uplift",
        priority: 2,
        workspace: "hospitality",
        workspaceId: "workspace-orania",
      },
      CONTEXT,
    );

    const withComment = service.recordComment(
      created.id,
      { text: "Review with operations before launch." },
      CONTEXT,
      "Mohammad Shafi",
    );

    const withLesson = service.recordLesson(
      created.id,
      { text: "Early stakeholder alignment reduced rework." },
      CONTEXT,
      "Mohammad Shafi",
    );

    expect(withComment?.timeline.some((entry) => entry.type === "comment")).toBe(true);
    expect(withLesson?.lessonsLearned).toHaveLength(1);
    expect(withLesson?.timeline.some((entry) => entry.type === "lesson")).toBe(true);
  });

  it("computes decision intelligence scores", () => {
    const decisions = service.searchDecisions({}, CONTEXT);
    const intelligence = service.getIntelligence(decisions[0]!.id, CONTEXT);

    expect(intelligence).toMatchObject({
      priorityScore: expect.any(Number),
      riskScore: expect.any(Number),
      businessImpact: expect.any(Number),
      confidenceScore: expect.any(Number),
      decisionAgeHours: expect.any(Number),
      escalationStatus: expect.any(String),
      dependencyAnalysis: expect.objectContaining({
        relatedCount: expect.any(Number),
        summary: expect.any(String),
      }),
    });
  });

  it("searches decisions with intelligence enrichment", () => {
    const results = service.searchDecisionsWithIntelligence(
      { workspace: "executive", keyword: "supplier" },
      CONTEXT,
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.intelligence.priorityScore).toBeGreaterThan(0);
    expect(results.every((entry) => entry.decision.title || entry.decision.recommendation.title)).toBe(
      true,
    );
  });

  it("emits platform events for transitions and lessons", () => {
    const created = service.createDecision(
      {
        recommendationId: "rec-events-p003",
        title: "Event platform test",
        text: "Event platform test",
        evidence: [],
        confidenceScore: 70,
        confidenceLabel: "medium",
        businessImpact: "Test",
        priority: 3,
        workspace: "executive",
        workspaceId: "workspace-orania",
      },
      CONTEXT,
    );

    service.transitionToStatus(
      created.id,
      { toStatus: "accepted" },
      CONTEXT,
      "Mohammad Shafi",
    );

    service.recordLesson(
      created.id,
      { text: "Validated event pipeline." },
      CONTEXT,
      "Mohammad Shafi",
    );

    const events = decisionEventStore.getByDecisionId(created.id);
    expect(events.some((event) => event.type === "decision.transitioned")).toBe(true);
    expect(events.some((event) => event.type === "decision.lesson_recorded")).toBe(true);
  });
});
