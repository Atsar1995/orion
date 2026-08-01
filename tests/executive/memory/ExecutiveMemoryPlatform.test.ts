import { describe, expect, it, beforeEach } from "vitest";
import { MemoryService } from "@/lib/executive/memory/MemoryService";
import { InMemoryKnowledgeRepository } from "@/lib/executive/memory/repository/InMemoryKnowledgeRepository";
import { memoryEventStore } from "@/lib/executive/memory/events/MemoryEvents";
import { buildSeedDecisions } from "@/lib/decisions/data/seed-decisions";
import { executiveLearningEngine } from "@/lib/decisions/learning/ExecutiveLearningEngine";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-004 Executive Memory Platform", () => {
  let service: MemoryService;

  beforeEach(() => {
    service = new MemoryService(new InMemoryKnowledgeRepository());
    memoryEventStore.clear();
  });

  it("initializes seed knowledge and ingests decisions", () => {
    const decisions = buildSeedDecisions();
    const learning = executiveLearningEngine.buildSnapshot(
      decisions,
      CONTEXT.userId,
      "Mohammad Shafi",
    );

    service.syncFromDecisions(decisions, CONTEXT, learning);

    const all = service.listAll(CONTEXT);
    expect(all.length).toBeGreaterThan(10);
    expect(all.some((entry) => entry.category === "executive_decision")).toBe(true);
    expect(all.some((entry) => entry.category === "customer")).toBe(true);
  });

  it("searches memory by keyword and entity", () => {
    service.syncFromDecisions(buildSeedDecisions(), CONTEXT);

    const keywordResults = service.searchMemories({ keyword: "Apex" }, CONTEXT);
    expect(keywordResults.length).toBeGreaterThan(0);

    const entityResults = service.searchMemories(
      { entityType: "customer", entityId: "cust-apex-retail" },
      CONTEXT,
    );
    expect(entityResults.length).toBeGreaterThan(0);
  });

  it("builds executive timeline from memory categories", () => {
    service.syncFromDecisions(buildSeedDecisions(), CONTEXT);
    const timeline = service.getTimeline(CONTEXT);

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline[0]).toMatchObject({
      title: expect.any(String),
      category: expect.any(String),
      workspace: expect.any(String),
    });
  });

  it("relates memories through the relationship engine", () => {
    service.syncFromDecisions(buildSeedDecisions(), CONTEXT);
    const customer = service.searchMemories({ category: "customer" }, CONTEXT)[0]?.entry;
    const reservation = service.searchMemories({ category: "reservation" }, CONTEXT)[0]?.entry;

    expect(customer).toBeTruthy();
    expect(reservation).toBeTruthy();

    const context = service.getRetrievalContext(customer!.id, CONTEXT);
    expect(context?.relationships.length).toBeGreaterThan(0);
    expect(context?.recommendedContext.length).toBeGreaterThan(0);
  });

  it("identifies organizational patterns", () => {
    const decisions = buildSeedDecisions();
    const learning = executiveLearningEngine.buildSnapshot(
      decisions,
      CONTEXT.userId,
      "Mohammad Shafi",
    );

    service.syncFromDecisions(decisions, CONTEXT, learning);
    const patterns = service.getPatterns(CONTEXT, decisions, learning);

    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0]?.confidence).toBeGreaterThan(0);
  });

  it("measures memory analytics", () => {
    service.syncFromDecisions(buildSeedDecisions(), CONTEXT);
    const analytics = service.getAnalytics(CONTEXT, buildSeedDecisions());

    expect(analytics.totalMemories).toBeGreaterThan(0);
    expect(analytics.relationshipDensity).toBeGreaterThanOrEqual(0);
    expect(analytics.byCategory.length).toBeGreaterThan(0);
  });

  it("provides brief-compatible memory items", () => {
    service.syncFromDecisions(buildSeedDecisions(), CONTEXT);
    const items = service.getBriefItems(CONTEXT);

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toMatchObject({
      title: expect.any(String),
      detail: expect.any(String),
      type: expect.any(String),
    });
  });

  it("creates new memory entries with audit trail", () => {
    const entry = service.createMemory(
      {
        category: "historical_context",
        title: "Weekend occupancy strategy",
        summary: "Rate optimization improved weekend yield by 6 points.",
        workspace: "hospitality",
        workspaceId: CONTEXT.workspaceId,
        tags: ["hospitality", "pricing"],
      },
      CONTEXT,
      "Mohammad Shafi",
    );

    expect(entry.auditHistory.length).toBe(1);
    expect(memoryEventStore.getByMemoryId(entry.id).some((event) => event.type === "memory.created")).toBe(
      true,
    );
  });
});
