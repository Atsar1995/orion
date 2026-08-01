import type { KnowledgeRepository } from "@/lib/executive/memory/repository/KnowledgeRepository";
import type { MemoryCategory, MemoryTimelineEntry } from "@/types/executive/memory";
import type { ServiceContext } from "@/types/services";

const TIMELINE_CATEGORIES = new Set<MemoryCategory>([
  "executive_decision",
  "business_outcome",
  "lesson_learned",
  "financial_event",
  "operational_event",
  "project",
  "meeting",
  "historical_context",
]);

/** Executive timeline from organizational memory (Mission P-004). */
export class MemoryTimelineEngine {
  constructor(private readonly repository: KnowledgeRepository) {}

  buildTimeline(
    context: ServiceContext,
    options?: { fromDate?: string; toDate?: string; workspace?: string },
  ): MemoryTimelineEntry[] {
    let entries = this.repository.listAll(context).filter((entry) =>
      TIMELINE_CATEGORIES.has(entry.category),
    );

    if (options?.workspace) {
      entries = entries.filter((entry) => entry.workspace === options.workspace);
    }

    if (options?.fromDate) {
      entries = entries.filter((entry) => entry.createdAt >= options.fromDate!);
    }

    if (options?.toDate) {
      entries = entries.filter((entry) => entry.createdAt <= options.toDate!);
    }

    return entries
      .map((entry) => ({
        id: `timeline-${entry.id}`,
        memoryId: entry.id,
        timestamp: entry.updatedAt,
        category: entry.category,
        title: entry.title,
        summary: entry.summary,
        workspace: entry.workspace,
        importance: entry.importance,
      }))
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp));
  }
}

export const createMemoryTimelineEngine = (repository: KnowledgeRepository) =>
  new MemoryTimelineEngine(repository);
