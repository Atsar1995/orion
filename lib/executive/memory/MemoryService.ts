import { seededDecisionRepository } from "@/lib/decisions/data/seed-decisions";
import { executiveLearningEngine } from "@/lib/decisions/learning/ExecutiveLearningEngine";
import { createMemoryAnalytics, MemoryAnalytics } from "@/lib/executive/memory/analytics/MemoryAnalytics";
import { emitMemoryEvent } from "@/lib/executive/memory/events/MemoryEvents";
import {
  buildSeedMemoryEntries,
  ingestDecisionsIntoMemory,
} from "@/lib/executive/memory/ingest/memory-ingest";
import { createMemoryTimelineEngine, MemoryTimelineEngine } from "@/lib/executive/memory/MemoryTimelineEngine";
import { createPatternEngine, PatternEngine } from "@/lib/executive/memory/PatternEngine";
import {
  createRelationshipEngine,
  RelationshipEngine,
} from "@/lib/executive/memory/RelationshipEngine";
import {
  createMemoryId,
  type KnowledgeRepository,
} from "@/lib/executive/memory/repository/KnowledgeRepository";
import { InMemoryKnowledgeRepository } from "@/lib/executive/memory/repository/InMemoryKnowledgeRepository";
import { createMemorySearchService, MemorySearchService } from "@/lib/executive/memory/search/MemorySearchService";
import type { ExecutiveMemoryItem } from "@/types/executive";
import type {
  CreateMemoryInput,
  KnowledgeRetrievalContext,
  MemoryAnalyticsSnapshot,
  MemoryEntry,
  MemoryPattern,
  MemorySearchFilter,
  MemorySearchResult,
  MemoryTimelineEntry,
} from "@/types/executive/memory";
import type { ExecutiveDecision, ExecutiveLearningSnapshot } from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

const DEFAULT_CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

function mapToBriefItem(entry: MemoryEntry): ExecutiveMemoryItem {
  const typeMap: Record<string, ExecutiveMemoryItem["type"]> = {
    executive_decision: "decision",
    business_outcome: "decision",
    lesson_learned: "lesson",
    historical_context: "context",
    recommendation: "pattern",
    operational_event: "pattern",
  };

  return {
    id: entry.id,
    type: typeMap[entry.category] ?? "context",
    title: entry.title,
    detail: entry.summary,
    recordedAt: entry.updatedAt,
    href: `/memory#${entry.id}`,
  };
}

/** Executive Memory Platform service (Mission P-004). */
export class MemoryService {
  private readonly relationshipEngine: RelationshipEngine;
  private readonly timelineEngine: MemoryTimelineEngine;
  private readonly patternEngine: PatternEngine;
  private readonly searchService: MemorySearchService;
  private readonly analytics: MemoryAnalytics;
  private initializedOrgs = new Set<string>();

  constructor(private readonly repository: KnowledgeRepository = new InMemoryKnowledgeRepository()) {
    this.relationshipEngine = createRelationshipEngine(repository);
    this.timelineEngine = createMemoryTimelineEngine(repository);
    this.patternEngine = createPatternEngine(repository);
    this.searchService = createMemorySearchService(repository);
    this.analytics = createMemoryAnalytics(repository);
  }

  private ensureInitialized(context: ServiceContext, executiveName = "Executive"): void {
    if (this.initializedOrgs.has(context.organizationId)) {
      return;
    }

    for (const entry of buildSeedMemoryEntries(context)) {
      this.repository.create(entry);
    }

    const decisions = seededDecisionRepository.listAll(context);
    const learning = executiveLearningEngine.buildSnapshot(
      decisions,
      context.userId,
      executiveName,
    );

    ingestDecisionsIntoMemory(this.repository, decisions, context, learning);
    this.relationshipEngine.indexOrganization(context);

    this.initializedOrgs.add(context.organizationId);
  }

  syncFromDecisions(
    decisions: ExecutiveDecision[],
    context: ServiceContext,
    learning?: ExecutiveLearningSnapshot,
  ): MemoryEntry[] {
    this.ensureInitialized(context);
    const ingested = ingestDecisionsIntoMemory(this.repository, decisions, context, learning);
    this.relationshipEngine.indexOrganization(context);
    return ingested;
  }

  createMemory(
    input: CreateMemoryInput,
    context: ServiceContext,
    authorName: string,
  ): MemoryEntry {
    this.ensureInitialized(context);
    const now = new Date().toISOString();

    const entry: MemoryEntry = {
      id: createMemoryId(),
      organizationId: context.organizationId,
      workspaceId: input.workspaceId,
      workspace: input.workspace,
      category: input.category,
      title: input.title,
      summary: input.summary,
      fullContext: input.fullContext ?? input.summary,
      relatedEntities: input.relatedEntities ?? [],
      relatedDecisionIds: input.relatedDecisionIds ?? [],
      evidence: input.evidence ?? [],
      authorId: context.userId,
      authorName,
      createdAt: now,
      updatedAt: now,
      confidence: input.confidence ?? 80,
      importance: input.importance ?? 3,
      tags: input.tags ?? [input.category, input.workspace],
      attachments: [],
      auditHistory: [
        {
          id: createMemoryId(),
          timestamp: now,
          actorId: context.userId,
          actorName: authorName,
          action: "created",
          detail: input.title,
        },
      ],
    };

    const created = this.repository.create(entry);
    emitMemoryEvent("memory.created", created.id, context.organizationId, {
      category: created.category,
    });

    return created;
  }

  getMemory(id: string, context: ServiceContext): MemoryEntry | null {
    this.ensureInitialized(context);
    return this.repository.findById(id, context);
  }

  searchMemories(filter: MemorySearchFilter, context: ServiceContext): MemorySearchResult[] {
    this.ensureInitialized(context);
    const results = this.searchService.search(filter, context);
    emitMemoryEvent("memory.searched", results[0]?.entry.id ?? "none", context.organizationId, {
      query: filter.query ?? filter.keyword ?? "",
      count: String(results.length),
    });
    return results;
  }

  getTimeline(
    context: ServiceContext,
    options?: { fromDate?: string; toDate?: string; workspace?: string },
  ): MemoryTimelineEntry[] {
    this.ensureInitialized(context);
    return this.timelineEngine.buildTimeline(context, options);
  }

  getPatterns(
    context: ServiceContext,
    decisions: ExecutiveDecision[] = [],
    learning?: ExecutiveLearningSnapshot,
  ): MemoryPattern[] {
    this.ensureInitialized(context);
    return this.patternEngine.analyze(context, decisions, learning);
  }

  getRetrievalContext(id: string, context: ServiceContext): KnowledgeRetrievalContext | null {
    this.ensureInitialized(context);
    const memory = this.repository.findById(id, context);

    if (!memory) {
      return null;
    }

    const relationships = this.repository.getRelationships(id, context);
    const relatedIds = this.relationshipEngine.getRelatedMemoryIds(id, context);
    const relatedEntries = relatedIds
      .map((relatedId) => this.repository.findById(relatedId, context))
      .filter((entry): entry is MemoryEntry => entry !== null);

    const relatedDecisions = relatedEntries.filter(
      (entry) => entry.category === "executive_decision",
    );
    const relatedLessons = relatedEntries.filter((entry) => entry.category === "lesson_learned");
    const relatedCustomers = relatedEntries.filter((entry) => entry.category === "customer");
    const relatedProjects = relatedEntries.filter((entry) => entry.category === "project");

    const historicalComparisons = this.repository
      .search({ category: memory.category, workspace: memory.workspace }, context)
      .filter((entry) => entry.id !== memory.id)
      .slice(0, 3);

    const recommendedContext = [
      ...relatedDecisions.slice(0, 2).map((entry) => `Related decision: ${entry.title}`),
      ...relatedLessons.slice(0, 2).map((entry) => `Lesson: ${entry.summary}`),
      ...relationships.slice(0, 2).map((rel) => rel.label),
    ];

    return {
      memory,
      relatedDecisions,
      relatedLessons,
      relatedCustomers,
      relatedProjects,
      historicalComparisons,
      recommendedContext,
      relationships,
    };
  }

  getAnalytics(context: ServiceContext, decisions: ExecutiveDecision[] = []): MemoryAnalyticsSnapshot {
    this.ensureInitialized(context);
    return this.analytics.buildSnapshot(context, decisions);
  }

  getBriefItems(context: ServiceContext, limit = 8): ExecutiveMemoryItem[] {
    this.ensureInitialized(context);

    return this.repository
      .listAll(context)
      .sort((left, right) => right.importance - left.importance || right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, limit)
      .map(mapToBriefItem);
  }

  listAll(context: ServiceContext): MemoryEntry[] {
    this.ensureInitialized(context);
    return this.repository.listAll(context);
  }
}

export const memoryService = new MemoryService();

export { DEFAULT_CONTEXT as MEMORY_DEFAULT_CONTEXT };
