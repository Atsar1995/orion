/**
 * ORION Executive Memory Platform — public API (Mission P-004).
 * All workspaces must consume organizational memory through this module.
 */

export { MemoryService, memoryService, MEMORY_DEFAULT_CONTEXT } from "@/lib/executive/memory/MemoryService";
export type { KnowledgeRepository } from "@/lib/executive/memory/repository/KnowledgeRepository";
export {
  InMemoryKnowledgeRepository,
  defaultKnowledgeRepository,
} from "@/lib/executive/memory/repository/InMemoryKnowledgeRepository";
export { RelationshipEngine, createRelationshipEngine } from "@/lib/executive/memory/RelationshipEngine";
export { MemoryTimelineEngine, createMemoryTimelineEngine } from "@/lib/executive/memory/MemoryTimelineEngine";
export { PatternEngine, createPatternEngine } from "@/lib/executive/memory/PatternEngine";
export { MemorySearchService, createMemorySearchService } from "@/lib/executive/memory/search/MemorySearchService";
export { MemoryAnalytics, createMemoryAnalytics } from "@/lib/executive/memory/analytics/MemoryAnalytics";
export { ingestDecisionsIntoMemory, buildSeedMemoryEntries } from "@/lib/executive/memory/ingest/memory-ingest";
export { emitMemoryEvent, memoryEventStore } from "@/lib/executive/memory/events/MemoryEvents";

export type {
  CreateMemoryInput,
  KnowledgeRetrievalContext,
  MemoryAnalyticsSnapshot,
  MemoryAttachment,
  MemoryAuditEntry,
  MemoryCategory,
  MemoryEntityReference,
  MemoryEntry,
  MemoryEvent,
  MemoryEventType,
  MemoryPattern,
  MemoryRelationship,
  MemoryRelationshipType,
  MemorySearchFilter,
  MemorySearchResult,
  MemoryTimelineEntry,
} from "@/types/executive/memory";
